import { api } from './api';
import type { Category, CategoryTag } from '@/src/types/category';

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function getTagsByCategory(categoryId: string): Promise<CategoryTag[]> {
  const { data } = await api.get<CategoryTag[]>(`/categories/${categoryId}/tags`);
  return data;
}
