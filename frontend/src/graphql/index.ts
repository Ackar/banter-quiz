import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AnswerQuizQuestionInput = {
  answerIndex: Scalars['Int'];
  gameId: Scalars['ID'];
};

export type CreateRoomInput = {
  playerName: Scalars['String'];
};

export type JoinRoomInput = {
  gameId: Scalars['ID'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  answerQuizQuestion: QuizState;
  createRoom: QuizState;
  nextQuestion: QuizState;
  restartGame: QuizState;
  validateAnswer: QuizState;
};


export type MutationAnswerQuizQuestionArgs = {
  input: AnswerQuizQuestionInput;
};


export type MutationCreateRoomArgs = {
  input: CreateRoomInput;
};


export type MutationNextQuestionArgs = {
  input: NextQuestionInput;
};


export type MutationRestartGameArgs = {
  input: RestartGameInput;
};


export type MutationValidateAnswerArgs = {
  input: ValidateAnswerInput;
};

export type NextQuestionInput = {
  gameId: Scalars['ID'];
};

export type Player = {
  __typename?: 'Player';
  host: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  score: Scalars['Int'];
};

export type PlayerAnswer = {
  __typename?: 'PlayerAnswer';
  answerIndex: Scalars['Int'];
  player: Player;
};

export type Query = {
  __typename?: 'Query';
  timeForAQuiz: Scalars['Boolean'];
};

export type QuizQuestion = {
  __typename?: 'QuizQuestion';
  answers: Array<Scalars['String']>;
  id: Scalars['ID'];
  question: Scalars['String'];
};

export type QuizState = {
  __typename?: 'QuizState';
  currentQuestion?: Maybe<QuizQuestion>;
  currentQuestionCorrectAnswer?: Maybe<Scalars['Int']>;
  currentQuestionIndex: Scalars['Int'];
  currentQuestionPickedAnswer?: Maybe<Scalars['Int']>;
  host: Scalars['Boolean'];
  id: Scalars['ID'];
  me: Player;
  players: Array<Player>;
  playersAnswers: Array<PlayerAnswer>;
  questionsCount: Scalars['Int'];
  score: Scalars['Int'];
};

export type RestartGameInput = {
  gameId: Scalars['ID'];
};

export type Subscription = {
  __typename?: 'Subscription';
  joinRoom: QuizState;
};


export type SubscriptionJoinRoomArgs = {
  input: JoinRoomInput;
};

export type ValidateAnswerInput = {
  answerIndex: Scalars['Int'];
  gameId: Scalars['ID'];
};

export type _Service = {
  __typename?: '_Service';
  sdl: Scalars['String'];
};

export type PlayerFragment = { __typename?: 'Player', id: string, name: string, host: boolean };

export type QuizStateFragment = { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> };

export type AnswerQuestionMutationVariables = Exact<{
  input: AnswerQuizQuestionInput;
}>;


export type AnswerQuestionMutation = { __typename?: 'Mutation', answerQuizQuestion: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export type CreateRoomMutationVariables = Exact<{
  input: CreateRoomInput;
}>;


export type CreateRoomMutation = { __typename?: 'Mutation', createRoom: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export type NextQuestionMutationVariables = Exact<{
  input: NextQuestionInput;
}>;


export type NextQuestionMutation = { __typename?: 'Mutation', nextQuestion: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export type RestartGameMutationVariables = Exact<{
  input: RestartGameInput;
}>;


export type RestartGameMutation = { __typename?: 'Mutation', restartGame: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export type ValidateAnswerMutationVariables = Exact<{
  input: ValidateAnswerInput;
}>;


export type ValidateAnswerMutation = { __typename?: 'Mutation', validateAnswer: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export type TimeForAQuizQueryVariables = Exact<{ [key: string]: never; }>;


export type TimeForAQuizQuery = { __typename?: 'Query', timeForAQuiz: boolean };

export type JoinRoomSubscriptionVariables = Exact<{
  input: JoinRoomInput;
}>;


export type JoinRoomSubscription = { __typename?: 'Subscription', quizState: { __typename?: 'QuizState', id: string, host: boolean, questionsCount: number, currentQuestionIndex: number, currentQuestionCorrectAnswer?: number | null, currentQuestionPickedAnswer?: number | null, score: number, me: { __typename?: 'Player', score: number, id: string, name: string, host: boolean }, players: Array<{ __typename?: 'Player', id: string, name: string, host: boolean }>, currentQuestion?: { __typename?: 'QuizQuestion', id: string, question: string, answers: Array<string> } | null, playersAnswers: Array<{ __typename?: 'PlayerAnswer', answerIndex: number, player: { __typename?: 'Player', id: string, name: string, host: boolean } }> } };

export const PlayerFragmentDoc = gql`
    fragment Player on Player {
  id
  name
  host
}
    `;
export const QuizStateFragmentDoc = gql`
    fragment QuizState on QuizState {
  id
  host
  me {
    ...Player
    score
  }
  players {
    ...Player
  }
  questionsCount
  currentQuestionIndex
  currentQuestion {
    id
    question
    answers
  }
  playersAnswers {
    player {
      ...Player
    }
    answerIndex
  }
  currentQuestionCorrectAnswer
  currentQuestionPickedAnswer
  score
}
    ${PlayerFragmentDoc}`;
export const AnswerQuestionDocument = gql`
    mutation AnswerQuestion($input: AnswerQuizQuestionInput!) {
  answerQuizQuestion(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useAnswerQuestionMutation() {
  return Urql.useMutation<AnswerQuestionMutation, AnswerQuestionMutationVariables>(AnswerQuestionDocument);
};
export const CreateRoomDocument = gql`
    mutation createRoom($input: CreateRoomInput!) {
  createRoom(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useCreateRoomMutation() {
  return Urql.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(CreateRoomDocument);
};
export const NextQuestionDocument = gql`
    mutation NextQuestion($input: NextQuestionInput!) {
  nextQuestion(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useNextQuestionMutation() {
  return Urql.useMutation<NextQuestionMutation, NextQuestionMutationVariables>(NextQuestionDocument);
};
export const RestartGameDocument = gql`
    mutation RestartGame($input: RestartGameInput!) {
  restartGame(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useRestartGameMutation() {
  return Urql.useMutation<RestartGameMutation, RestartGameMutationVariables>(RestartGameDocument);
};
export const ValidateAnswerDocument = gql`
    mutation ValidateAnswer($input: ValidateAnswerInput!) {
  validateAnswer(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useValidateAnswerMutation() {
  return Urql.useMutation<ValidateAnswerMutation, ValidateAnswerMutationVariables>(ValidateAnswerDocument);
};
export const TimeForAQuizDocument = gql`
    query timeForAQuiz {
  timeForAQuiz
}
    `;

export function useTimeForAQuizQuery(options?: Omit<Urql.UseQueryArgs<TimeForAQuizQueryVariables>, 'query'>) {
  return Urql.useQuery<TimeForAQuizQuery, TimeForAQuizQueryVariables>({ query: TimeForAQuizDocument, ...options });
};
export const JoinRoomDocument = gql`
    subscription JoinRoom($input: JoinRoomInput!) {
  quizState: joinRoom(input: $input) {
    ...QuizState
  }
}
    ${QuizStateFragmentDoc}`;

export function useJoinRoomSubscription<TData = JoinRoomSubscription>(options: Omit<Urql.UseSubscriptionArgs<JoinRoomSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<JoinRoomSubscription, TData>) {
  return Urql.useSubscription<JoinRoomSubscription, TData, JoinRoomSubscriptionVariables>({ query: JoinRoomDocument, ...options }, handler);
};