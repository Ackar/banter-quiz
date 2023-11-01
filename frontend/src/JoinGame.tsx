import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import Content from "./components/Content";
import { useTimeForAQuizQuery } from "./graphql";
// import { useJoinRoomMutation } from "./graphql";

type NameInput = {
  name: string;
};

export default function JoinGame() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameInput>({
    defaultValues: {
      name: localStorage.getItem("name") ?? undefined,
    },
  });
  // This is just a hack to make sure the user ID cookie is set.
  // The websocket connection alone doesn't set the cookie.
  const [{}] = useTimeForAQuizQuery({ requestPolicy: "network-only" });

  return (
    <Content>
      What is your name?
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row gap-3">
          <input
            className="flex-1 rounded p-2 text-xl text-black"
            placeholder="Name"
            {...register("name", { required: true })}
          />
          <input
            type="submit"
            className="bg-blue-700 text-blue-200 hover:text-white py-2 px-5 rounded w-max"
            value="Start"
          />
        </div>
        {errors.name && <div className="mt-2">Please provide a name</div>}
      </form>
    </Content>
  );

  async function onSubmit(data: NameInput) {
    localStorage.setItem("name", data.name);

    navigate(`/game/${gameId}`);
  }
}
