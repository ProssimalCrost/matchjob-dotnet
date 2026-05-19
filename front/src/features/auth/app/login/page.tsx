"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/src/features/auth/services/authService";
import { getMyProfessionalProfile } from "@/src/features/professionals/services/professionalService";
import { setToken } from "@/src/shared/utils/token";
import { supabase } from "@/src/shared/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await login({ email, password });

      setToken(response.Token);

      try {
        await getMyProfessionalProfile();
        router.push("/professionals");
      } catch {
        router.push("/profile/setup");
      }
    } catch (error: unknown) {
      console.error(error);

      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Erro ao fazer login. Verifique seus dados.";

      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Erro ao entrar com Google:", error.message);
        alert("Erro ao entrar com Google.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao tentar entrar com Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-slate-950 px-4"
      style={{
        backgroundImage: "url('/logos/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
      >
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-violet-400 transition hover:text-violet-300 mb-6"
        >
          MatchJob
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Entrar</h1>

        <p className="text-slate-400 mb-8">Acesse sua conta no MatchJob.</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold py-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? "Redirecionando..." : "Entrar com Google"}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-500">ou entre com e-mail</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">E-mail</label>

            <input
              type="email"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Senha</label>

            <input
              type="password"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-violet-400 transition hover:text-violet-300"
          >
            Criar conta
          </Link>
        </p>
      </form>
    </main>
  );
}