"use client";

import { FormEvent, useEffect, useState } from "react";
import { Sidebar } from "@/src/shared/components/Navbar";
import {
  EditProfessionalProfileForm,
  Professional,
} from "@/src/features/professionals/types/professionalTypes";
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
} from "@/src/features/professionals/services/professionalService";

const mockCategories = [
  { id: "1", name: "Desenvolvimento" },
  { id: "2", name: "Design" },
  { id: "3", name: "Elétrica" },
  { id: "4", name: "Hidráulica" },
  { id: "5", name: "Limpeza" },
  { id: "6", name: "Mecânica" },
];

const mockTagsByCategory: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "1", name: "React" },
    { id: "2", name: "Node.js" },
    { id: "3", name: ".NET" },
    { id: "4", name: "Spring Boot" },
  ],
  "2": [
    { id: "5", name: "Figma" },
    { id: "6", name: "Logo" },
    { id: "7", name: "UI Design" },
  ],
  "3": [
    { id: "8", name: "Instalação" },
    { id: "9", name: "Chuveiro" },
    { id: "10", name: "Tomada" },
  ],
  "4": [
    { id: "11", name: "Vazamento" },
    { id: "12", name: "Encanamento" },
    { id: "13", name: "Caixa d'água" },
  ],
  "5": [
    { id: "14", name: "Diarista" },
    { id: "15", name: "Faxina pesada" },
    { id: "16", name: "Pós-obra" },
  ],
  "6": [
    { id: "17", name: "Moto" },
    { id: "18", name: "Carro" },
    { id: "19", name: "Troca de óleo" },
  ],
};

export default function EditProfessionalProfilePage() {
  const [profile, setProfile] = useState<Professional | null>(null);
  const [form, setForm] = useState<EditProfessionalProfileForm>({
    description: "",
    categoryId: "",
    location: "",
    priceRange: "",
    tagIds: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableTags = form.categoryId
    ? mockTagsByCategory[form.categoryId] ?? []
    : [];

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfessionalProfile();

        setProfile(data);

        setForm({
          description: data.Description ?? "",
          categoryId: "",
          location: data.Location ?? "",
          priceRange: data.PriceRange ?? "",
          tagIds: [],
        });
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar perfil profissional.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(
    field: keyof EditProfessionalProfileForm,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCategoryChange(categoryId: string) {
    setForm((prev) => ({
      ...prev,
      categoryId,
      tagIds: [],
    }));
  }

  function handleToggleTag(tagId: string) {
    setForm((prev) => {
      const alreadySelected = prev.tagIds.includes(tagId);

      return {
        ...prev,
        tagIds: alreadySelected
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.description.trim()) {
      alert("Informe uma descrição profissional.");
      return;
    }

    if (!form.categoryId) {
      alert("Selecione uma categoria.");
      return;
    }

    if (!form.location.trim()) {
      alert("Informe sua localização.");
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateMyProfessionalProfile({
        description: form.description,
        categoryId: form.categoryId,
        location: form.location,
        priceRange: form.priceRange,
        tagIds: form.tagIds,
      });

      setProfile(updatedProfile);
      alert("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil profissional.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="flex">
          <Sidebar />

          <section className="flex-1 px-6 py-20 lg:py-10">
            <p className="text-slate-600">Carregando perfil...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-20 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                Editar perfil profissional
              </h1>

              <p className="mt-2 text-slate-600">
                Atualize suas informações para aparecer melhor nas buscas do
                MatchJob.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Descrição profissional
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        handleChange("description", event.target.value)
                      }
                      rows={5}
                      placeholder="Ex: Desenvolvedor fullstack especializado em sistemas web, APIs e landing pages..."
                      className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Categoria
                      </label>

                      <select
                        value={form.categoryId}
                        onChange={(event) =>
                          handleCategoryChange(event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                      >
                        <option value="">Selecione uma categoria</option>

                        {mockCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Localização
                      </label>

                      <input
                        value={form.location}
                        onChange={(event) =>
                          handleChange("location", event.target.value)
                        }
                        placeholder="Ex: Timóteo - MG"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Faixa de preço
                    </label>

                    <input
                      value={form.priceRange}
                      onChange={(event) =>
                        handleChange("priceRange", event.target.value)
                      }
                      placeholder="Ex: R$ 80 - R$ 150/hora ou A combinar"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tags sugeridas pela categoria
                    </label>

                    {!form.categoryId ? (
                      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        Selecione uma categoria para ver as tags disponíveis.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const selected = form.tagIds.includes(tag.id);

                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleToggleTag(tag.id)}
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                selected
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:text-purple-700"
                              }`}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              </form>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-2xl font-bold text-white">
                    {profile?.UserName?.charAt(0) || "?"}
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      {profile?.UserName || "Profissional"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Prévia do perfil
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700">Descrição</p>
                    <p className="mt-1 text-slate-500">
                      {form.description || "Sem descrição informada."}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Localização</p>
                    <p className="mt-1 text-slate-500">
                      {form.location || "Não informada"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Preço</p>
                    <p className="mt-1 text-slate-500">
                      {form.priceRange || "A combinar"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Avaliação</p>
                    <p className="mt-1 text-slate-500">
                      {profile?.Rating ?? 0} estrelas
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}