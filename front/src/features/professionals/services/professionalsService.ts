import { httpGet } from "@/core/api/httpClient";
import { Profissional } from "../types/profissional";

export async function getProfessionals(): Promise<Profissional[]> {
  return httpGet<Profissional[]>("/professionals");
}