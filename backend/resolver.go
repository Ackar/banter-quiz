package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand"
	"slices"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/graph-gophers/graphql-go"
)

type resolver struct {
	games            map[graphql.ID]*QuizState
	gamesLock        sync.Mutex
	openTriviaClient *OpenTriviaClient
}

func newResolver(openTrivia *OpenTriviaClient) *resolver {
	return &resolver{
		games:            make(map[graphql.ID]*QuizState),
		openTriviaClient: openTrivia,
	}
}

type QuizState struct {
	ID                           graphql.ID
	Players                      []Player
	QuestionsCount               int32
	CurrentQuestionIndex         int32
	PlayersAnswers               []PlayerAnswer
	CurrentQuestionCorrectAnswer *int32
	CurrentQuestionPickedAnswer  *int32
	Score                        int32

	// used to shuffle answers in a predictable but unique manner
	randNumber    int64
	questions     []Question
	listeners     map[string]chan *QuizState
	listenersLock sync.Mutex
	playersLock   sync.Mutex
	answersLock   sync.Mutex
}

func (q *QuizState) CurrentQuestion() *QuizQuestion {
	if int(q.CurrentQuestionIndex) >= len(q.questions) {
		return nil
	}
	current := q.questions[q.CurrentQuestionIndex]

	answers := []string{
		current.CorrectAnswer,
	}
	answers = append(answers, current.IncorrectAnswers...)
	randSource := rand.NewSource(q.randNumber + int64(q.CurrentQuestionIndex))
	rand.New(randSource).Shuffle(len(answers), func(i, j int) {
		answers[i], answers[j] = answers[j], answers[i]
	})

	return &QuizQuestion{
		Question: current.Question,
		Answers:  answers,
	}
}

func (q *QuizState) Host(ctx context.Context) bool {
	userID := userIDFromContext(ctx)
	for _, p := range q.Players {
		if p.ID == graphql.ID(userID) {
			return p.Host
		}
	}
	return false
}

func (q *QuizState) updateListeners() {
	q.listenersLock.Lock()
	for _, listener := range q.listeners {
		listener <- q
	}
	q.listenersLock.Unlock()
}

func (q *QuizState) deleteListener(sessionID string) {
	q.listenersLock.Lock()
	delete(q.listeners, sessionID)
	q.listenersLock.Unlock()
}

func (q *QuizState) deletePlayer(userID string) {
	// Give it a bit of time before removing the player in case it's just an
	// intermittent connection issue or the page was reloaded
	<-time.After(2 * time.Second)

	q.playersLock.Lock()
	defer q.playersLock.Unlock()

	idx := slices.IndexFunc(q.Players, func(p Player) bool {
		return p.ID == graphql.ID(userID)
	})
	if idx == -1 {
		return
	}
	// If the player has rejoined don't delete it
	if time.Since(q.Players[idx].joinedAt) < 2*time.Second {
		return
	}
	slog.Info("deleting player", slog.String("player", userID))
	wasHost := q.Players[idx].Host
	q.Players = slices.Delete(q.Players, idx, idx+1)

	q.answersLock.Lock()
	answerIdx := slices.IndexFunc(q.PlayersAnswers, func(a PlayerAnswer) bool {
		return a.playerID == graphql.ID(userID)
	})
	if answerIdx != -1 {
		q.PlayersAnswers = slices.Delete(q.PlayersAnswers, answerIdx, answerIdx+1)
	}
	q.answersLock.Unlock()

	// promote next player to be host
	if wasHost && len(q.Players) > 0 {
		q.Players[0].Host = true
	}
}

type Player struct {
	ID   graphql.ID
	Name string
	Host bool

	joinedAt time.Time
}

type QuizQuestion struct {
	ID       graphql.ID
	Question string
	Answers  []string
}

type PlayerAnswer struct {
	game     *QuizState
	playerID graphql.ID

	AnswerIndex int32
}

func (a PlayerAnswer) Player() (*Player, error) {
	for _, p := range a.game.Players {
		if p.ID == a.playerID {
			return &p, nil
		}
	}
	return nil, fmt.Errorf("invalid player %q", a.playerID)
}

type joinRoomInput struct {
	GameID graphql.ID
	Name   string
}

func (r *resolver) JoinRoom(ctx context.Context, args struct {
	Input joinRoomInput
}) (chan *QuizState, error) {
	userID := userIDFromContext(ctx)
	sessionID := uuid.New().String()

	if _, ok := r.games[args.Input.GameID]; !ok {
		return nil, fmt.Errorf("room doesn't exist")
	}

	game := r.games[args.Input.GameID]

	game.playersLock.Lock()
	playerIdx := slices.IndexFunc(game.Players, func(p Player) bool { return p.ID == graphql.ID(userID) })
	if playerIdx == -1 {
		game.Players = append(r.games[args.Input.GameID].Players, Player{
			ID:       graphql.ID(userID),
			Name:     args.Input.Name,
			Host:     false,
			joinedAt: time.Now(),
		})
	} else {
		game.Players[playerIdx].joinedAt = time.Now()
	}
	game.playersLock.Unlock()

	slog.Info("player joined", slog.String("name", args.Input.Name), slog.String("id", userID))

	go r.games[args.Input.GameID].updateListeners()

	c := make(chan *QuizState)
	game.listeners[sessionID] = c

	go func() {
		// send the current state immediately
		c <- game

		<-ctx.Done()
		slog.Info("player disconnected", slog.String("user-id", userID))
		game.deleteListener(sessionID)
		game.deletePlayer(userID)
		go game.updateListeners()
		close(c)
		r.cleanGame(game.ID)
	}()

	return c, nil
}

type createRoomInput struct {
	PlayerName string
}

func (r *resolver) CreateRoom(ctx context.Context, args struct {
	Input createRoomInput
}) (*QuizState, error) {
	userID := userIDFromContext(ctx)

	questions, err := r.openTriviaClient.GetQuestions()
	if err != nil {
		slog.Error("error fetching questions", slog.Any("err", err))
		return nil, fmt.Errorf("error fetching questions")
	}
	game := &QuizState{
		ID: graphql.ID(uuid.New().String()),
		Players: []Player{
			{
				ID:   graphql.ID(userID),
				Name: args.Input.PlayerName,
				Host: true,
			},
		},
		QuestionsCount: int32(len(questions)),

		randNumber: time.Now().UnixMilli(),
		questions:  questions,
		listeners:  make(map[string]chan *QuizState),
	}

	r.games[game.ID] = game

	slog.Info("created new room", slog.String("host", args.Input.PlayerName), slog.String("id", string(game.ID)))

	return game, nil
}

type answerQuizQuestionInput struct {
	GameID      graphql.ID
	AnswerIndex int32
}

func (r *resolver) AnswerQuizQuestion(ctx context.Context, args struct {
	Input answerQuizQuestionInput
}) (*QuizState, error) {
	userID := userIDFromContext(ctx)

	game := r.games[args.Input.GameID]

	if args.Input.AnswerIndex < 0 ||
		int(args.Input.AnswerIndex) >= len(game.CurrentQuestion().Answers) {
		return nil, fmt.Errorf("invalid answer index")
	}

	game.answersLock.Lock()
	defer game.answersLock.Unlock()
	var found bool
	for i, a := range game.PlayersAnswers {
		if a.playerID == graphql.ID(userID) {
			// update existing answer
			found = true
			game.PlayersAnswers[i].AnswerIndex = args.Input.AnswerIndex
			break
		}
	}
	if !found {
		game.PlayersAnswers = append(game.PlayersAnswers, PlayerAnswer{
			game:        game,
			playerID:    graphql.ID(userID),
			AnswerIndex: args.Input.AnswerIndex,
		})
	}

	go game.updateListeners()
	return game, nil
}

type validateAnswerInput struct {
	GameID      graphql.ID
	AnswerIndex int32
}

func (r *resolver) ValidateAnswer(ctx context.Context, args struct {
	Input validateAnswerInput
}) (*QuizState, error) {
	game := r.games[args.Input.GameID]
	if !game.Host(ctx) {
		return nil, fmt.Errorf("player is not the host")
	}
	correctIdx := int32(slices.Index(game.CurrentQuestion().Answers, game.questions[game.CurrentQuestionIndex].CorrectAnswer))

	game.CurrentQuestionPickedAnswer = &args.Input.AnswerIndex
	game.CurrentQuestionCorrectAnswer = &correctIdx

	if args.Input.AnswerIndex == correctIdx {
		game.Score++
	}

	go game.updateListeners()

	return game, nil
}

type nextQuestionInput struct {
	GameID graphql.ID
}

func (r *resolver) NextQuestion(ctx context.Context, args struct {
	Input nextQuestionInput
}) (*QuizState, error) {
	game := r.games[args.Input.GameID]
	if !game.Host(ctx) {
		return nil, fmt.Errorf("player is not the host")
	}
	game.CurrentQuestionIndex++
	game.CurrentQuestionPickedAnswer = nil
	game.CurrentQuestionCorrectAnswer = nil
	game.PlayersAnswers = nil

	go game.updateListeners()

	return game, nil
}

type restartGameInput struct {
	GameID graphql.ID
}

func (r *resolver) RestartGame(ctx context.Context, args struct {
	Input restartGameInput
}) (*QuizState, error) {
	game := r.games[args.Input.GameID]
	if !game.Host(ctx) {
		return nil, fmt.Errorf("player is not the host")
	}

	slog.Info("restarting game", slog.String("game-id", string(game.ID)))

	questions, err := r.openTriviaClient.GetQuestions()
	if err != nil {
		return nil, fmt.Errorf("error fetching questions: %w", err)
	}

	game.CurrentQuestionIndex = 0
	game.Score = 0
	game.CurrentQuestionPickedAnswer = nil
	game.CurrentQuestionCorrectAnswer = nil
	game.PlayersAnswers = nil
	game.questions = questions
	game.QuestionsCount = int32(len(questions))
	game.randNumber = time.Now().UnixMilli()

	go game.updateListeners()

	return game, nil
}

func (r *resolver) cleanGame(gameID graphql.ID) {
	r.gamesLock.Lock()
	defer r.gamesLock.Unlock()

	if _, ok := r.games[graphql.ID(gameID)]; !ok {
		return
	}

	// If all players left the game, delete the room...
	if len(r.games[graphql.ID(gameID)].Players) == 0 {
		delete(r.games, gameID)
		slog.Info("deleted empty room", slog.String("id", string(gameID)))
	}
}

func (r *resolver) TimeForAQuiz() bool {
	return true
}

func userIDFromContext(ctx context.Context) string {
	userID, ok := ctx.Value(UserIDKey{}).(string)
	if !ok {
		return "unknown"
	}
	return userID
}
