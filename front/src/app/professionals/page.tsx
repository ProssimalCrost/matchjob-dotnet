"use client";

import { useEffect, useState } from "react";
import { getProfessionals } from "@/src/features/professionals/services/professionalService";
import { Professional } from "@/src/features/professionals/types/professionalTypes";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const data = await getProfessionals();
        console.log(data);
        setProfessionals(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao buscar profissionais.");
      } finally {
        setLoading(false);
      }
    }

    loadProfessionals();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Carregando profissionais...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Profissionais</h1>
          <p className="text-slate-400 mt-2">
            Encontre freelancers e prestadores de serviço disponíveis.
          </p>
        </div>

        {professionals.length === 0 ? (
          <p className="text-slate-400">
            Nenhum profissional encontrado.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional) => (
              <article
                key={professional.Id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">
                    {professional.UserName?.charAt(0) || "?"}
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg">
                      {professional.UserName}
                    </h2>

                    <p className="text-sm text-slate-400">
                      {professional.Description}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                  {professional.Description || "Sem descrição informada."}
                </p>

                <div className="space-y-2 text-sm text-slate-400">
                  <p>
                    <strong className="text-slate-200">Categoria:</strong>{" "}
                    {professional.Category}
                  </p>

                  <p>
                    <strong className="text-slate-200">Local:</strong>{" "}
                    {professional.Location}
                  </p>

                  <p>
                    <strong className="text-slate-200">Status:</strong>{" "}
                    {professional.Status === "available"
                      ? "Disponível"
                      : "Ocupado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(professional.Tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="w-full mt-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium transition">
                  Ver perfil
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}