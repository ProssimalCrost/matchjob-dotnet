import axios from "axios";
import { getToken, removeToken, setToken } from "@/src/shared/utils/token";

// Migra token salvo com a chave antiga ("token") para a chave correta ("matchjob_token")
// Isso corrige usuários que fizeram login antes do fix do Navbar.
if (typeof window !== "undefined") {
  const legacyToken = window.localStorage.getItem("token");
  if (legacyToken && !getToken()) {
    setToken(legacyToken);
    window.localStorage.removeItem("token");
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5279",
  headers: {
    "Content-Type": "application/json",
  },
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Redireciona para /login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();

      if (typeof window !== "undefined") {
        // location.replace não adiciona entrada no histórico de navegação
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);
