import { api } from "@/src/core/api/api";
import type { Tag } from "../types/tagTypes";

export async function getTags(): Promise<Tag[]> {
  const response = await api.get<Tag[]>("/tags");
  return response.data;
}