"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/src/features/auth/services/authService";
import { setToken } from "@/src/shared/utils/token";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await login({
        email,
        password,
      });

      setToken(response.token);

      router.push("/professionals");
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer login. Verifique seus dados.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4"
    style={{
        backgroundImage: "url('/logos/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Entrar</h1>

        <p className="text-slate-400 mb-8">
          Acesse sua conta no MatchJob.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              E-mail
            </label>

            <input
              type="email"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Senha
            </label>

            <input
              type="password"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 transition"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}