"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import { getFavorites, removeFavorite } from "@/src/features/favorites/services/favoriteService";
import type { Professional } from "@/src/features/professionals/types/professionalTypes";
import { StarIcon, MapPinIcon, HeartIcon } from "@heroicons/react/24/solid";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: string) {
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.Id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-slate-600">Carregando favoritos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Favoritos</h1>
              <p className="mt-1 text-sm text-slate-500">
                Profissionais que você salvou.
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <HeartIcon className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                <h3 className="text-lg font-bold text-slate-900">
                  Nenhum favorito ainda
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Explore profissionais e salve seus favoritos.
                </p>
                <button
                  onClick={() => router.push("/professionals")}
                  className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Explorar profissionais
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {favorites.map((p) => (
                  <article
                    key={p.Id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-xl font-bold text-white">
                        {p.UserName.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-slate-900">
                          {p.UserName}
                        </h3>
                        {p.Title && (
                          <p className="text-sm text-purple-600 truncate">{p.Title}</p>
                        )}
                        <p className="text-xs text-slate-400">{p.Category}</p>
                        {p.Location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPinIcon className="h-3 w-3" />
                            {p.Location}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemove(p.Id)}
                        className="shrink-0 rounded-xl p-2 text-red-400 transition hover:bg-red-50"
                        title="Remover dos favoritos"
                      >
                        <HeartIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <StarIcon className="h-4 w-4" />
                        {p.Rating.toFixed(1)} ({p.ReviewCount})
                      </span>
                      <span
                        className={`text-xs font-medium ${p.Available ? "text-green-600" : "text-slate-400"}`}
                      >
                        {p.Available ? "Disponível" : "Ocupado"}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/professionals/${p.Id}`)}
                      className="mt-4 w-full rounded-2xl bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Ver perfil
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
