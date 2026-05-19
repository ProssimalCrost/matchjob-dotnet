"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, getTagsByCategory } from "@/src/features/professionals/services/categoryService";
import { createMyProfessionalProfile } from "@/src/features/professionals/services/professionalService";
import type { Category } from "@/src/features/professionals/types/categoryTypes";
import type { Tag } from "@/src/features/professionals/types/tagTypes";
import { SparklesIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function ProfileSetupPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setTags([]);
      setSelectedTagIds([]);
      return;
    }
    getTagsByCategory(categoryId).then(setTags).catch(console.error);
    setSelectedTagIds([]);
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

    if (!title.trim()) {
      alert("Informe seu título profissional.");
      return;
    }

    try {
      setLoading(true);

      await createMyProfessionalProfile({
        title: title.trim(),
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
          ?.data?.message ?? "Erro ao salvar perfil.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 ring-1 ring-purple-500/20 mb-4">
            <SparklesIcon className="h-4 w-4" />
            Configure seu perfil profissional
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao MatchJob!
          </h1>
          <p className="mt-3 text-slate-400">
            Complete seu perfil para aparecer nas buscas e receber oportunidades.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Título profissional *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenvolvedor Fullstack, Eletricista, Designer UI"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Sobre você
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva sua experiência, serviços oferecidos e diferencial."
              rows={4}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Categoria *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
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
              <label className="mb-2 block text-sm font-medium text-slate-300">
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
                          ? "border-purple-500 bg-purple-600 text-white"
                          : "border-slate-600 bg-slate-800 text-slate-300 hover:border-purple-400"
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
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Ipatinga, MG"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Faixa de preço
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="Ex: R$ 50 - R$ 150/hora"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Valor por hora (R$)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="80"
              min={0}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                available ? "bg-purple-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  available ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-slate-300">
              {available ? "Disponível para contratação" : "Indisponível no momento"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvando perfil..." : "Criar meu perfil profissional"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Você pode editar estas informações a qualquer momento no seu perfil.
          </p>
        </form>
      </div>
    </main>
  );
}
