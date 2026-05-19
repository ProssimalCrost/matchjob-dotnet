"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfessionals } from "@/src/features/professionals/services/professionalService";
import { getCategories } from "@/src/features/professionals/services/categoryService";
import { addFavorite, removeFavorite, checkFavorite } from "@/src/features/favorites/services/favoriteService";
import { Professional } from "@/src/features/professionals/types/professionalTypes";
import { Category } from "@/src/features/professionals/types/categoryTypes";
import { Sidebar } from "@/src/shared/components/Navbar";
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";

export default function ProfessionalsPage() {
  const router = useRouter();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [result, cats] = await Promise.all([
          getProfessionals({ page: 1, pageSize: 50 }),
          getCategories(),
        ]);

        const data = result.Data ?? [];
        setProfessionals(data);
        setTotal(result.Total ?? data.length);
        setCategories(cats);
      } catch (error) {
        console.error(error);
        setProfessionals([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredProfessionals = useMemo(
    () =>
      [...professionals]
        .sort((a, b) => b.Rating - a.Rating)
        .slice(0, 6),
    [professionals],
  );

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((p) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.UserName?.toLowerCase().includes(s) ||
        p.Title?.toLowerCase().includes(s) ||
        p.Bio?.toLowerCase().includes(s) ||
        p.Category?.toLowerCase().includes(s) ||
        p.Location?.toLowerCase().includes(s) ||
        p.Tags?.some((t) => t.Name.toLowerCase().includes(s));

      const matchesCategory =
        !selectedCategoryId || p.CategoryId === selectedCategoryId;

      const matchesRating =
        !minRating || p.Rating >= Number(minRating);

      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [professionals, search, selectedCategoryId, minRating]);

  async function toggleFavorite(id: string) {
    try {
      if (favoriteIds.has(id)) {
        await removeFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addFavorite(id);
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
    } catch {
      // silently ignore auth errors on the listing page
    }
  }

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

        <section className="flex-1 px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {/* Hero banner */}
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
                    Busque por área, localização, tags e avaliações.
                  </p>

                  <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 shadow-lg">
                    <div className="flex flex-1 items-center gap-3 px-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Busque por dev, designer, eletricista..."
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
                  <strong className="mt-2 block text-5xl font-bold">{total}</strong>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-slate-400">Categorias</p>
                      <strong className="mt-1 block text-2xl">{categories.length}</strong>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-slate-400">Resultados</p>
                      <strong className="mt-1 block text-2xl">
                        {filteredProfessionals.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured */}
            {featuredProfessionals.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-5 text-2xl font-bold text-slate-900">
                  Em destaque
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-4">
                  {featuredProfessionals.map((p) => (
                    <article
                      key={p.Id}
                      onClick={() => router.push(`/professionals/${p.Id}`)}
                      className="min-w-[260px] cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-lg font-bold text-white">
                          {p.UserName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.UserName}</p>
                          <p className="text-xs text-purple-600">{p.Title || p.Category}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-yellow-600">
                          <StarIcon className="h-4 w-4" />
                          {p.Rating.toFixed(1)} ({p.ReviewCount})
                        </span>
                        <span className={`text-xs font-medium ${p.Available ? "text-green-600" : "text-slate-400"}`}>
                          {p.Available ? "Disponível" : "Ocupado"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Filters */}
            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Categoria
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.Id} value={cat.Id}>
                        {cat.Name}
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
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                  >
                    <option value="">Todas</option>
                    <option value="3">3 estrelas ou mais</option>
                    <option value="4">4 estrelas ou mais</option>
                    <option value="4.5">4.5 estrelas ou mais</option>
                  </select>
                </div>
              </div>

              {(search || selectedCategoryId || minRating) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategoryId("");
                    setMinRating("");
                  }}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Limpar filtros
                </button>
              )}
            </section>

            {/* Grid */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Todos os profissionais
                </h2>
                <p className="text-sm text-slate-500">
                  {filteredProfessionals.length} resultado(s)
                </p>
              </div>

              {filteredProfessionals.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <h3 className="text-lg font-bold text-slate-900">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Tente outros filtros ou termos de busca.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProfessionals.map((p) => (
                    <ProfessionalCard
                      key={p.Id}
                      professional={p}
                      isFavorite={favoriteIds.has(p.Id)}
                      onToggleFavorite={() => toggleFavorite(p.Id)}
                      onView={() => router.push(`/professionals/${p.Id}`)}
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

function ProfessionalCard({
  professional: p,
  isFavorite,
  onToggleFavorite,
  onView,
}: {
  professional: Professional;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onView: () => void;
}) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
          {p.UserName?.charAt(0) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{p.UserName}</h3>
          {p.Title && (
            <p className="text-sm font-medium text-purple-700 truncate">{p.Title}</p>
          )}
          <p className="mt-0.5 text-xs font-medium text-slate-500">{p.Category}</p>
          {p.Location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <MapPinIcon className="h-3.5 w-3.5" />
              {p.Location}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`shrink-0 rounded-xl p-2 transition ${
            isFavorite ? "text-red-500" : "text-slate-300 hover:text-red-400"
          }`}
        >
          {isFavorite ? (
            <HeartIcon className="h-5 w-5" />
          ) : (
            <HeartOutline className="h-5 w-5" />
          )}
        </button>
      </div>

      {p.Bio && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{p.Bio}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Avaliação</p>
          <strong className="mt-1 flex items-center gap-1 text-sm text-slate-900">
            <StarIcon className="h-4 w-4 text-yellow-500" />
            {p.Rating.toFixed(1)}
            <span className="text-xs font-normal text-slate-400">
              ({p.ReviewCount})
            </span>
          </strong>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Status</p>
          <strong
            className={`mt-1 block text-sm ${p.Available ? "text-green-600" : "text-slate-400"}`}
          >
            {p.Available ? "Disponível" : "Ocupado"}
          </strong>
        </div>
      </div>

      {p.Tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.Tags.slice(0, 4).map((tag) => (
            <span
              key={tag.Id}
              className="inline-flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
            >
              <TagIcon className="h-2.5 w-2.5" />
              {tag.Name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onView}
        className="mt-5 w-full rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
      >
        Ver perfil
      </button>
    </article>
  );
}
