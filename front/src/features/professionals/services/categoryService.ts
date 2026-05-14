import { api } from "@/src/core/api/api";
import type { Category } from "../types/categoryTypes";
import type { Tag } from "../types/tagTypes";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function getTagsByCategory(categoryId: string): Promise<Tag[]> {
  const response = await api.get<Tag[]>(`/categories/${categoryId}/tags`);
  return response.data;
}