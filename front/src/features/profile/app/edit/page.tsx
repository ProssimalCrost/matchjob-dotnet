"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import { getCategories, getTagsByCategory } from "@/src/features/professionals/services/categoryService";
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
} from "@/src/features/professionals/services/professionalService";
import type { Category } from "@/src/features/professionals/types/categoryTypes";
import type { Tag } from "@/src/features/professionals/types/tagTypes";
import type { Professional } from "@/src/features/professionals/types/professionalTypes";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function ProfileEditPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Professional | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prof, cats] = await Promise.all([
          getMyProfessionalProfile(),
          getCategories(),
        ]);
        setProfile(prof);
        setCategories(cats);

        setTitle(prof.Title ?? "");
        setBio(prof.Bio ?? "");
        setLocation(prof.Location ?? "");
        setPriceRange(prof.PriceRange ?? "");
        setPrice(prof.Price?.toString() ?? "");
        setCategoryId(prof.CategoryId ?? "");
        setSelectedTagIds(prof.Tags.map((t) => t.Id));
        setAvailable(prof.Available);

        if (prof.CategoryId) {
          const tagList = await getTagsByCategory(prof.CategoryId);
          setTags(tagList);
        }
      } catch {
        router.push("/profile/setup");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!categoryId) {
      setTags([]);
      return;
    }
    getTagsByCategory(categoryId).then(setTags).catch(console.error);
  }, [categoryId]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) {
      alert("Selecione uma categoria.");
      return;
    }

    try {
      setSaving(true);

      await updateMyProfessionalProfile({
        title: title.trim() || undefined,
        bio: bio.trim() || undefined,
        categoryId,
        tagIds: selectedTagIds,
        location: location.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
        price: price ? Number(price) : undefined,
        available,
      });

      router.push("/professionals");
    } catch (error: unknown) {
      console.error(error);
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Erro ao atualizar perfil.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-slate-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Editar Perfil</h1>
              <p className="mt-1 text-sm text-slate-500">
                Atualize suas informações profissionais.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6"
            >
              {profile && (
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-2xl font-bold text-white">
                    {profile.UserName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{profile.UserName}</p>
                    <p className="text-sm text-slate-500">{profile.UserEmail}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Título profissional
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Fullstack"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sobre você
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Descreva sua experiência e serviços."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.Id} value={cat.Id}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              {tags.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Habilidades / Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.Id);
                      return (
                        <button
                          key={tag.Id}
                          type="button"
                          onClick={() => toggleTag(tag.Id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? "border-purple-600 bg-purple-600 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-300"
                          }`}
                        >
                          {selected && <CheckIcon className="h-3 w-3" />}
                          {tag.Name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Ipatinga, MG"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Valor por hora (R$)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="80"
                    min={0}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Faixa de preço
                </label>
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="Ex: R$ 50 - R$ 150/hora"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    available ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      available ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-600">
                  {available ? "Disponível para contratação" : "Indisponível no momento"}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
