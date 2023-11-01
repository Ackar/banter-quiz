import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="flex flex-col items-center mt-10">
        <div className="w-96">
          <TV />
        </div>
        <h1
          className="font-titan text-8xl font-bold drop-shadow-xl mt-10"
          style={{
            // background:
            //   "url(https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWo4ZzJwMGxxdHNhejFwdHhnbHloZm43ZnVjd2E4YXJ1eWk4MW1sciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/byccSCWztDM2c/giphy.gif)",
            background:
              "url(https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXIxd2E0eGRpMjgyNzk1N2pnOXQxeTEya3Rld21tZzVmbXdvejhlciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ncWIVXM13MFX2/giphy.gif)",
            backgroundClip: "text",
            backgroundSize: "100%",
            color: "transparent",
            backgroundPosition: "center 5%",
            // animationName: "MOVE-BG",
            // animationDuration: "10s",
            // animationTimingFunction: "linear",
            // animationIterationCount: "infinite",
          }}
        >
          Banter Quiz
        </h1>
        <Link
          to={"/new"}
          className="text-2xl bg-purple-900 hover:bg-purple-800 text-white p-5 rounded-xl mt-16 shadow-xl duration-300"
        >
          New Game
        </Link>
      </div>
    </div>
  );
}

function TV() {
  return (
    <div className="relative w-full aspect-[1299/864] overflow-hidden pt-[5%] pr-[16%] pb-[20%]">
      <img src="/tv.png" className="absolute top-0 w-full drop-shadow-xl" />
      <img
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2Y2cHNtdzZmdTc2eHhkYno3OGoxYmtreGxhNXdsd3RsMG5uNHFybSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10ymc81nmlAzfy/giphy.gif"
        className="w-[90%]"
      />
    </div>
  );
}

export default App;
