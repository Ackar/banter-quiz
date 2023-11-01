import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Content from "./components/Content";
import TV from "./components/TV";
import { useCreateRoomMutation } from "./graphql";

type NameInput = {
  name: string;
};

export default function NewGame() {
  const navigate = useNavigate();
  const [{ fetching }, createRoom] = useCreateRoomMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameInput>({
    defaultValues: {
      name: localStorage.getItem("name") ?? undefined,
    },
  });
  const [createError, setCreateError] = useState<string | undefined>();

  if (fetching) {
    return (
      <Content>
        <div className="text-center">
          <p className="mb-5 text-xl">Your game will start soon. Probably.</p>
          <TV contentUrl="https://media.giphy.com/media/l0O7NLWCi7kJYnCuY/giphy-downsized.gif" />
        </div>
      </Content>
    );
  }

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
        {createError && <div className="mt-2">Error: ${createError}</div>}
      </form>
    </Content>
  );

  async function onSubmit(data: NameInput) {
    localStorage.setItem("name", data.name);

    let res = await createRoom({
      input: {
        playerName: data.name,
      },
    });

    if (res.error) {
      setCreateError(res.error.message);
      return;
    }

    navigate(`/game/${res.data?.createRoom.id}`);
  }
}
