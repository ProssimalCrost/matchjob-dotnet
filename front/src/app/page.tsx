import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="max-w-3xl text-center">
        <span className="inline-block mb-4 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
          MatchJob
        </span>

        <h1 className="text-5xl font-bold mb-6">
          Encontre o profissional ideal para o seu projeto
        </h1>

        <p className="text-slate-400 text-lg mb-8">
          Uma plataforma para conectar clientes e profissionais autônomos com
          filtros, perfil completo, avaliações e match por habilidades.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/professionals"
            className="rounded-lg bg-purple-600 hover:bg-purple-700 px-6 py-3 font-semibold transition"
          >
            Buscar profissionais
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 hover:border-purple-500 px-6 py-3 font-semibold transition"
          >
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}