"use client";

import { useEffect, useMemo, useState } from "react";
import { getProfessionals } from "@/src/features/professionals/services/professionalService";
import { Professional } from "@/src/features/professionals/types/professionalTypes";
import { Sidebar } from "@/src/shared/components/Navbar";
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedTag, setSelectedTag] = useState("Todas");
  const [minRating, setMinRating] = useState("Todas");

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const result = await getProfessionals({
          page: 1,
          pageSize: 12,
        });
        setProfessionals(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error(error);
        alert("Erro ao buscar profissionais.");
      } finally {
        setLoading(false);
      }
    }

    loadProfessionals();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = professionals
      .map((professional) => professional.Category)
      .filter(Boolean);

    return ["Todas", ...Array.from(new Set(uniqueCategories))];
  }, [professionals]);

  const suggestedTags = useMemo(() => {
    const allTags = professionals.flatMap((professional) => professional.Tags || []);
    return ["Todas", ...Array.from(new Set(allTags))];
  }, [professionals]);

  const featuredProfessionals = useMemo(() => {
    return [...professionals]
      .sort((a, b) => Number(b.Rating || 0) - Number(a.Rating || 0))
      .slice(0, 6);
  }, [professionals]);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        professional.UserName?.toLowerCase().includes(searchValue) ||
        professional.Description?.toLowerCase().includes(searchValue) ||
        professional.Category?.toLowerCase().includes(searchValue) ||
        professional.Location?.toLowerCase().includes(searchValue) ||
        professional.Tags?.some((tag) => tag.toLowerCase().includes(searchValue));

      const matchesCategory =
        selectedCategory === "Todas" || professional.Category === selectedCategory;

      const matchesTag =
        selectedTag === "Todas" || professional.Tags?.includes(selectedTag);

      const matchesRating =
        minRating === "Todas" || Number(professional.Rating || 0) >= Number(minRating);

      return matchesSearch && matchesCategory && matchesTag && matchesRating;
    });
  }, [professionals, search, selectedCategory, selectedTag, minRating]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-slate-300">Carregando profissionais...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <section className="mb-10 overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 ring-1 ring-purple-500/20">
                    <SparklesIcon className="h-4 w-4" />
                    Encontre profissionais autônomos confiáveis
                  </span>

                  <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                    Contrate o profissional certo para o seu serviço.
                  </h1>

                  <p className="mt-4 max-w-2xl text-base text-slate-300">
                    Busque por área, localização, tags, avaliações e especialidades.
                    O MatchJob conecta clientes a profissionais de diferentes setores.
                  </p>

                  <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 shadow-lg">
                    <div className="flex flex-1 items-center gap-3 px-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Busque por dev, designer, eletricista, diarista..."
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <button className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
                      Buscar
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-400">Profissionais cadastrados</p>
                  <strong className="mt-2 block text-5xl font-bold">
                    {professionals.length}
                  </strong>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-slate-400">Categorias</p>
                      <strong className="mt-1 block text-2xl">
                        {categories.length - 1}
                      </strong>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-slate-400">Tags</p>
                      <strong className="mt-1 block text-2xl">
                        {suggestedTags.length - 1}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {featuredProfessionals.length > 0 && (
              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Profissionais em destaque
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Os melhores avaliados aparecem primeiro.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-4">
                  {featuredProfessionals.map((professional) => (
                    <article
                      key={professional.Id}
                      className="min-w-[280px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-xl font-bold text-white">
                          {professional.UserName?.charAt(0) || "?"}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {professional.UserName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {professional.Category}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                        {professional.Description || "Sem descrição informada."}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1 text-yellow-600">
                          <StarIcon className="h-4 w-4" />
                          {professional.Rating || "0"}
                        </span>

                        <span className="font-semibold text-purple-700">
                          {professional.PriceRange || "A combinar"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tag sugerida
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(event) => setSelectedTag(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                  >
                    {suggestedTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Avaliação mínima
                  </label>
                  <select
                    value={minRating}
                    onChange={(event) => setMinRating(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                  >
                    <option value="Todas">Todas</option>
                    <option value="3">3 estrelas ou mais</option>
                    <option value="4">4 estrelas ou mais</option>
                    <option value="4.5">4.5 estrelas ou mais</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {suggestedTags.slice(1, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${selectedTag === tag
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-300 hover:text-purple-700"
                      }`}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Todos os profissionais
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {filteredProfessionals.length} resultado(s) encontrado(s).
                  </p>
                </div>

                {(search || selectedCategory !== "Todas" || selectedTag !== "Todas" || minRating !== "Todas") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("Todas");
                      setSelectedTag("Todas");
                      setMinRating("Todas");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {filteredProfessionals.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <h3 className="text-lg font-bold text-slate-900">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Tente buscar por outra categoria, tag ou localização.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProfessionals.map((professional) => (
                    <ProfessionalCard
                      key={professional.Id}
                      professional={professional}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
          {professional.UserName?.charAt(0) || "?"}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900">
            {professional.UserName}
          </h3>

          <p className="mt-1 text-sm font-medium text-purple-700">
            {professional.Category || "Categoria não informada"}
          </p>

          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPinIcon className="h-4 w-4" />
            {professional.Location || "Local não informado"}
          </p>
        </div>
      </div>

      <p className="mt-5 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-600">
        {professional.Description || "Sem descrição informada."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Preço</p>
          <strong className="mt-1 block text-sm text-slate-900">
            {professional.PriceRange || "A combinar"}
          </strong>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Avaliação</p>
          <strong className="mt-1 flex items-center gap-1 text-sm text-slate-900">
            <StarIcon className="h-4 w-4 text-yellow-500" />
            {professional.Rating || "0"}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(professional.Tags || []).slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <button className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
        Ver perfil
      </button>
    </article>
  );
}