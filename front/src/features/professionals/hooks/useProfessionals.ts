import { useEffect, useState } from "react";
import { Profissional } from "../types/profissional";
import { getProfessionals } from "../services/professionalsService";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getProfessionals();
      setProfessionals(data);
    } catch (err) {
      setError("Erro ao carregar profissionais");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    professionals,
    isLoading,
    error,
    reload: load,
  };
}