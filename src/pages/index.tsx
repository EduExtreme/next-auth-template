import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { withSSRGuest } from "../../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("diego@rocketseat.team");
  const [password, setPassword] = useState("");
  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  }
  return (
    <main className="h-screen bg-zinc-950 text-black flex flex-col gap-10 items-center justify-center">
      <form
        className="flex flex-col gap-4 w-full max-w-xs"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="text-emerald-500 text-sm" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = withSSRGuest<{
  user: string[];
}>(async (ctx) => {
  return {
    props: {},
  };
});
