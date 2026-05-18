import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-screen text-white flex items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/logos/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <section className="max-w-3xl text-center">
        <span>
          <img
            src="/logos/logositeb.png"
            alt="logo"
            className="w-[700px] mx-auto mb-20"
          />
        </span>

        <h1 className="text-5xl font-bold mb-6">
          Encontre o profissional ideal para o seu projeto
        </h1>

        <p className="text-slate-300 text-lg mb-8">
          Uma plataforma para conectar clientes e profissionais autônomos com
          filtros, perfil completo, avaliações e match por habilidades.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg border border-purple-500 hover:bg-purple-700 px-6 py-3 font-semibold transition"
          >
            Registre-se
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-purple-600 border-slate-200 hover:border-purple-500 px-6 py-3 font-semibold transition"
          >
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}