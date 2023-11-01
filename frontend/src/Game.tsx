import { useParams } from "react-router";
import Content from "./components/Content";
import {
  Player,
  useAnswerQuestionMutation,
  useJoinRoomSubscription,
  useNextQuestionMutation,
  useRestartGameMutation,
  useValidateAnswerMutation,
} from "./graphql";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";

export default function Game() {
  const { gameId } = useParams();
  const [{ data, error }] = useJoinRoomSubscription({
    variables: {
      input: { gameId: gameId!, name: localStorage.getItem("name") || "Zorro" },
    },
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [{}, answerQuestion] = useAnswerQuestionMutation();
  const [{}, validateAnswer] = useValidateAnswerMutation();
  const [{}, nextQuestion] = useNextQuestionMutation();
  const [{}, restartGame] = useRestartGameMutation();

  if (error) {
    return (
      <Content>
        <p>Oops, something went wrong...</p>
        <p>{JSON.stringify(error)}</p>
        <a href="/" className="bg-blue-800 px-2 py-2 rounded w-max">
          🏠 Go back to the home page
        </a>
      </Content>
    );
  }

  if (!data) {
    return <></>;
  }

  const answersPlayers = new Map<number, Player[]>();
  data.quizState.playersAnswers.map((a) => {
    // TODO: make that better
    answersPlayers.set(a.answerIndex, [
      ...(answersPlayers.get(a.answerIndex) ?? []),
      a.player,
    ]);
  });

  const joinLink = `https://${location.hostname}/join/${gameId}`;
  const correctAnswer =
    data.quizState.currentQuestionCorrectAnswer ===
    data.quizState.currentQuestionPickedAnswer;

  if (!data.quizState.currentQuestion) {
    return (
      <Content logo={true}>
        <div className="text-center flex flex-col items-center gap-7">
          <div className="text-4xl">Score</div>
          <div className="text-6xl">
            {data.quizState.score}/{data.quizState.currentQuestionIndex}
          </div>
          {data.quizState.score < 10 ? (
            <img src="https://media.giphy.com/media/2UCt7zbmsLoCXybx6t/giphy-downsized.gif" />
          ) : (
            <img src="https://media.giphy.com/media/jQDozgWeDXUoQZ1htF/giphy.gif" />
          )}
          {data.quizState.host && (
            <button
              className="bg-blue-800 px-2 py-2 rounded w-max text-lg"
              onClick={() => {
                restartGame({ input: { gameId: gameId! } });
              }}
            >
              New game
            </button>
          )}
        </div>
      </Content>
    );
  }

  return (
    <Content
      logo={true}
      state={
        data.quizState.currentQuestionPickedAnswer !== null
          ? correctAnswer
            ? "success"
            : "failure"
          : undefined
      }
    >
      <div className="flex flex-row justify-between bg-slate-300 text-slate-600 py-2 px-5 rounded shadow-inner">
        <div>
          {data.quizState.players.find((p) => p.host)?.name} is the host{" "}
        </div>
        <div
          title="The host picks the answer and control the game."
          className="bg-white rounded-full"
        >
          ❓
        </div>
      </div>
      <div className="text-xs opacity-50">
        Question {data.quizState.currentQuestionIndex + 1}/
        {data.quizState.questionsCount}
      </div>
      <p className="font-[inter] text-lg">
        {data.quizState.currentQuestion?.question}
      </p>
      {data.quizState.currentQuestion?.answers.map((answer, idx) => (
        <div className="relative flex flex-row gap-2">
          <div className="flex-1 flex flex-col">
            <button
              className={`bg-blue-900 text-blue-100 font-[Inter] py-2 rounded hover:bg-blue-800 hover:text-white duration-200 flex-1 ${
                data.quizState.currentQuestionCorrectAnswer === idx
                  ? "bg-green-700"
                  : ""
              } ${
                data.quizState.currentQuestionPickedAnswer === idx &&
                data.quizState.currentQuestionPickedAnswer !==
                  data.quizState.currentQuestionCorrectAnswer
                  ? "bg-red-800"
                  : ""
              }`}
              onClick={() => {
                answerQuestion({
                  input: {
                    gameId: gameId!,
                    answerIndex: idx,
                  },
                });
              }}
            >
              {answer}
            </button>
            {answersPlayers.get(idx) && (
              <div className="bg-blue-800 py-2 px-2 -mt-1 flex flex-row gap-1 rounded flex-wrap">
                {answersPlayers.get(idx)?.map((p) => (
                  <div className="w-max text-xs bg-green-700 text-white p-1 rounded-full">
                    👍 {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {data.quizState.host &&
            data.quizState.currentQuestionPickedAnswer === null && (
              <button
                className="bg-blue-900 text-blue-100 py-2 px-2 rounded hover:bg-blue-800 hover:text-white duration-200"
                onClick={() => {
                  validateAnswer({
                    input: { gameId: gameId!, answerIndex: idx },
                  });
                }}
              >
                ✅
              </button>
            )}
        </div>
      ))}
      {data.quizState.currentQuestionPickedAnswer !== null &&
        data.quizState.host && (
          <button
            className="bg-cyan-700 py-2 rounded mt-5"
            onClick={() => {
              nextQuestion({ input: { gameId: gameId! } });
            }}
          >
            ➡️ Next question
          </button>
        )}
      <h2 className="">Players</h2>
      <div className="flex flex-row flex-wrap gap-2">
        {data.quizState.players.map((player) => (
          <div
            className={`bg-purple-900 w-max p-1 rounded text-sm ${
              player.host ? "border-white border" : ""
            }`}
          >
            {player.name} {player.host && "(Host)"}
          </div>
        ))}
      </div>
      <h2>Invite players</h2>
      <CopyToClipboard
        text={joinLink}
        onCopy={() => {
          updateLinkCopied();
        }}
      >
        <div className="relative text-xs font-mono bg-black px-2 py-2 w-full overflow-ellipsis overflow-hidden whitespace-nowrap">
          {joinLink}
        </div>
      </CopyToClipboard>
      <CopyToClipboard
        text={joinLink}
        onCopy={() => {
          updateLinkCopied();
        }}
      >
        <button className="text-sm bg-gray-700 p-1 rounded ml-2">
          {!linkCopied ? "Copy Link" : "Copied!"}
        </button>
      </CopyToClipboard>
    </Content>
  );

  function updateLinkCopied() {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }
}
