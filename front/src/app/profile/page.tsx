import { Navbar } from "../../shared/components/Navbar";

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-950">Perfil</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            Seu nome
          </h2>
          <p className="mt-1 text-slate-600">Atualize seus dados profissionais.</p>
        </section>
      </main>
    </>
  );
}

