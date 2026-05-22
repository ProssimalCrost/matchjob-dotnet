"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { syncUser } from "@/src/features/auth/services/authService";
import { setToken } from "@/src/shared/utils/token";
import { supabase } from "@/src/shared/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.session) {
        alert("Verifique seu e-mail para confirmar o cadastro.");
        router.push("/login");
        return;
      }

      setToken(data.session.access_token);

      // Garante que o usuário existe na tabela local antes de ir para /profile/setup
      await syncUser();

      router.push("/profile/setup");
    } catch (err: unknown) {
      console.error(err);
      alert("Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
      style={{
        backgroundImage: "url('/logos/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-md content-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-semibold text-violet-400 transition hover:text-violet-300"
            >
              MatchJob
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
              Criar conta
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Crie sua conta para encontrar profissionais, divulgar seus
              serviços ou se conectar com novas oportunidades.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha segura"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar minha conta"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
