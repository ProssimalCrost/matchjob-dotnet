// src/features/professionals/hooks/useProfessionals.ts

import { useEffect, useMemo, useState } from "react";
import { Profissional } from "../types/profissional";
import { getProfessionals } from "../services/professionalsService";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setIsLoading(true);
      const data = await getProfessionals();
      setProfessionals(data);
    } catch {
      setError("Erro ao carregar profissionais");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProfessionals = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) return professionals;

    return professionals.filter((professional) => {
      return (
        professional.name.toLowerCase().includes(text) ||
        professional.category.toLowerCase().includes(text) ||
        professional.location.toLowerCase().includes(text) ||
        professional.tags.some((tag) => tag.toLowerCase().includes(text))
      );
    });
  }, [professionals, search]);

  useEffect(() => {
    load();
  }, []);

  return {
    professionals: filteredProfessionals,
    search,
    setSearch,
    isLoading,
    error,
    reload: load,
  };
}