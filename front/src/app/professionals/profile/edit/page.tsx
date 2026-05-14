"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";

import {
  getCategories,
  getTagsByCategory,
} from "@/src/features/professionals/services/categoryService";

import type { Category } from "@/src/features/professionals/types/categoryTypes";
import type { Tag } from "@/src/features/professionals/types/tagTypes";
import type {
  EditProfessionalProfileForm,
  Professional,
} from "@/src/features/professionals/types/professionalTypes";

import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
} from "@/src/features/professionals/services/professionalService";

const initialForm: EditProfessionalProfileForm = {
  description: "",
  categoryId: "",
  location: "",
  priceRange: "",
  tagIds: [],
};

type TextFormField = "description" | "location" | "priceRange";

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export default function EditProfessionalProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Professional | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [form, setForm] = useState<EditProfessionalProfileForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [loadingTags, setLoadingTags] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === form.categoryId);
  }, [categories, form.categoryId]);

  const selectedTags = useMemo(() => {
    return tags.filter((tag) => form.tagIds.includes(tag.id));
  }, [tags, form.tagIds]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const [profileData, categoriesData] = await Promise.all([
        getMyProfessionalProfile(),
        getCategories(),
      ]);

      setProfile(profileData);
      setCategories(categoriesData);

      const currentCategory = categoriesData.find(
        (category) =>
          normalizeText(category.name) === normalizeText(profileData.Category),
      );

      let categoryTags: Tag[] = [];

      if (currentCategory?.id) {
        categoryTags = await getTagsByCategory(currentCategory.id);
        setTags(categoryTags);
      }

      const currentTagIds = categoryTags
        .filter((tag) =>
          profileData.Tags?.some(
            (profileTag) => normalizeText(profileTag) === normalizeText(tag.name),
          ),
        )
        .map((tag) => tag.id);

      setForm({
        description: profileData.Description ?? "",
        categoryId: currentCategory?.id ?? "",
        location: profileData.Location ?? "",
        priceRange: profileData.PriceRange ?? "",
        tagIds: currentTagIds,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados do perfil.");
    } finally {
      setLoading(false);
    }
  }

  function handleTextChange(field: TextFormField, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleCategoryChange(categoryId: string) {
    setForm((prev) => ({
      ...prev,
      categoryId,
      tagIds: [],
    }));

    if (!categoryId) {
      setTags([]);
      return;
    }

    try {
      setLoadingTags(true);

      const categoryTags = await getTagsByCategory(categoryId);

      setTags(categoryTags);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar tags da categoria.");
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  }

  function handleToggleTag(tagId: string) {
    setForm((prev) => {
      const selected = prev.tagIds.includes(tagId);

      return {
        ...prev,
        tagIds: selected
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      };
    });
  }

  function validateForm() {
    if (!form.description.trim()) {
      alert("Informe uma descrição profissional.");
      return false;
    }

    if (!form.categoryId) {
      alert("Selecione uma categoria.");
      return false;
    }

    if (!form.location.trim()) {
      alert("Informe sua localização.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const updatedProfile = await updateMyProfessionalProfile({
        description: form.description.trim(),
        categoryId: form.categoryId,
        location: form.location.trim(),
        priceRange: form.priceRange.trim(),
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
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-20 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <PageHeader />

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <ProfileEditForm
                form={form}
                categories={categories}
                tags={tags}
                selectedCategory={selectedCategory}
                loadingTags={loadingTags}
                saving={saving}
                onSubmit={handleSubmit}
                onTextChange={handleTextChange}
                onCategoryChange={handleCategoryChange}
                onToggleTag={handleToggleTag}
                onCancel={() => router.back()}
              />

              <ProfilePreview
                profile={profile}
                form={form}
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-20 lg:px-10 lg:py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-slate-600">Carregando perfil...</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Editar perfil profissional
      </h1>

      <p className="mt-2 text-slate-600">
        Atualize suas informações para aparecer melhor nas buscas do MatchJob.
      </p>
    </div>
  );
}

type ProfileEditFormProps = {
  form: EditProfessionalProfileForm;
  categories: Category[];
  tags: Tag[];
  selectedCategory?: Category;
  loadingTags: boolean;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTextChange: (field: TextFormField, value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onToggleTag: (tagId: string) => void;
  onCancel: () => void;
};

function ProfileEditForm({
  form,
  categories,
  tags,
  selectedCategory,
  loadingTags,
  saving,
  onSubmit,
  onTextChange,
  onCategoryChange,
  onToggleTag,
  onCancel,
}: ProfileEditFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-5">
        <TextAreaField
          label="Descrição profissional"
          value={form.description}
          placeholder="Ex: Desenvolvedor fullstack especializado em sistemas web, APIs e landing pages..."
          onChange={(value) => onTextChange("description", value)}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Categoria"
            value={form.categoryId}
            onChange={onCategoryChange}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />

          <InputField
            label="Localização"
            value={form.location}
            placeholder="Ex: Timóteo - MG"
            onChange={(value) => onTextChange("location", value)}
          />
        </div>

        <InputField
          label="Faixa de preço"
          value={form.priceRange}
          placeholder="Ex: R$ 80 - R$ 150/hora ou A combinar"
          onChange={(value) => onTextChange("priceRange", value)}
        />

        <TagsSelector
          categorySelected={Boolean(form.categoryId)}
          selectedCategory={selectedCategory}
          tags={tags}
          selectedTagIds={form.tagIds}
          loadingTags={loadingTags}
          onToggleTag={onToggleTag}
        />

        <FormActions saving={saving} onCancel={onCancel} />
      </div>
    </form>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function InputField({ label, value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
      />
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
      >
        <option value="">Selecione uma categoria</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TagsSelectorProps = {
  categorySelected: boolean;
  selectedCategory?: Category;
  tags: Tag[];
  selectedTagIds: string[];
  loadingTags: boolean;
  onToggleTag: (tagId: string) => void;
};

function TagsSelector({
  categorySelected,
  selectedCategory,
  tags,
  selectedTagIds,
  loadingTags,
  onToggleTag,
}: TagsSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Tags
      </label>

      {!categorySelected ? (
        <InfoBox>
          Selecione uma categoria para escolher tags relacionadas ao seu serviço.
        </InfoBox>
      ) : loadingTags ? (
        <InfoBox>Carregando tags da categoria...</InfoBox>
      ) : tags.length === 0 ? (
        <InfoBox>Nenhuma tag cadastrada para essa categoria.</InfoBox>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
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

      {selectedCategory && (
        <p className="mt-3 text-xs text-slate-500">
          Categoria selecionada: <strong>{selectedCategory.name}</strong>
        </p>
      )}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
      {children}
    </p>
  );
}

type FormActionsProps = {
  saving: boolean;
  onCancel: () => void;
};

function FormActions({ saving, onCancel }: FormActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
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
  );
}

type ProfilePreviewProps = {
  profile: Professional | null;
  form: EditProfessionalProfileForm;
  selectedCategory?: Category;
  selectedTags: Tag[];
};

function ProfilePreview({
  profile,
  form,
  selectedCategory,
  selectedTags,
}: ProfilePreviewProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-2xl font-bold text-white">
          {profile?.UserName?.charAt(0) || "?"}
        </div>

        <div>
          <h2 className="font-bold text-slate-900">
            {profile?.UserName || "Profissional"}
          </h2>
          <p className="text-sm text-slate-500">Prévia do perfil</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <PreviewItem
          label="Categoria"
          value={selectedCategory?.name || "Não informada"}
        />

        <PreviewItem
          label="Descrição"
          value={form.description || "Sem descrição informada."}
        />

        <PreviewItem
          label="Localização"
          value={form.location || "Não informada"}
        />

        <PreviewItem label="Preço" value={form.priceRange || "A combinar"} />

        <PreviewItem
          label="Avaliação"
          value={`${profile?.Rating ?? 0} estrelas`}
        />

        <div>
          <p className="font-semibold text-slate-700">Tags</p>

          {selectedTags.length === 0 ? (
            <p className="mt-1 text-slate-500">Nenhuma tag selecionada.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

type PreviewItemProps = {
  label: string;
  value: string;
};

function PreviewItem({ label, value }: PreviewItemProps) {
  return (
    <div>
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-slate-500">{value}</p>
    </div>
  );
}