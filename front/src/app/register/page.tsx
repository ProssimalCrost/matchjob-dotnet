import Link from "next/link";

import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <div className="mb-8">
        <Link className="text-sm font-medium text-slate-500" href="/">
          MatchJob
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          Criar conta
        </h1>
        <p className="mt-2 text-slate-600">
          Informe seus dados para comecar.
        </p>
      </div>
      <form className="grid gap-4">
        <Input label="Nome" name="name" placeholder="Seu nome" />
        <Input label="E-mail" name="email" placeholder="voce@email.com" />
        <Input label="Senha" name="password" type="password" />
        <Button type="submit">Cadastrar</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Ja tem conta?{" "}
        <Link className="font-medium text-slate-950" href="/login">
          Entrar
        </Link>
      </p>
    </main>
  );
}

