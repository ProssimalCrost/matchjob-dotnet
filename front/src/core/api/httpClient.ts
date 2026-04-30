const API_URL = process.env.EXPO_PUBLIC_API_URL; 

export async function httpGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Erro na requisição");
  }

  return response.json();
}