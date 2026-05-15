import { Sidebar } from "@/src/shared/components/Navbar";

export default function ChatPage() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <section className="flex-1 px-6 py-10 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mensagens</h1>
          <p className="mt-2 text-slate-400">
            Converse com clientes e acompanhe seus atendimentos.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Caixa de mensagens</h2>
          <p className="mt-2 text-slate-400">
            Nenhuma conversa carregada no momento.
          </p>
        </div>
      </section>
    </main>
  );
}