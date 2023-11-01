import { ReactNode } from "react";

export default function Content({
  children,
  //   state = "none",
  logo = false,
}: {
  children: ReactNode;
  state?: string;
  logo?: boolean;
}) {
  //   const backgroundStates = new Map<string, string | undefined>([
  //     ["none", undefined],
  //     ["success", "https://media.giphy.com/media/hTh9bSbUPWMWk/giphy.gif"],
  //     ["failure", "https://media.giphy.com/media/Lopx9eUi34rbq/giphy.gif"],
  //   ]);
  //   const background = backgroundStates.get(state);

  return (
    <div className="relative w-96 bg-gray-900 text-blue-100 px-5 py-5 rounded-xl shadow-xl flex flex-col gap-3">
      {logo && (
        <h1
          className="absolute left-full w-max text-6xl rotate-90 origin-bottom-left ml-3"
          //   style={{
          //     background: background && `url(${background})`,
          //     backgroundClip: background && "text",
          //     backgroundSize: "cover",
          //     color: background && "transparent",
          //     backgroundPosition: "bottom",
          //   }}
        >
          Banter Quiz
        </h1>
      )}
      {children}
    </div>
  );
}
