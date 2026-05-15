import Link from "next/link";

import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    style={{
        backgroundImage: "url('/logos/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
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

          <form className="grid gap-5">
            <Input
              label="Nome"
              name="name"
              placeholder="Seu nome completo"
            />

            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="voce@email.com"
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Crie uma senha segura"
            />

            <Button type="submit" className="mt-2 w-full">
              Criar minha conta
            </Button>
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