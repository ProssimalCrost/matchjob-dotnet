import { Profissional } from "../types/profissional";

export const professionalsMock: Profissional[] = [
  {
    id: "1",
    name: "Carlos Mendes",
    category: "Eletricista",
    location: "Timóteo, MG",
    rating: 4.8,
    priceRange: "R$ 80 - R$ 150",
    tags: ["Residencial", "Urgência", "Instalação"],
    avatarUrl: "https://example.com/avatar1.jpg"
  },
  {
    id: "2",
    name: "Ana Souza",
    category: "Designer",
    location: "Ipatinga, MG",
    rating: 4.9,
    priceRange: "R$ 120 - R$ 300",
    tags: ["Logo", "Social Media", "Branding"],
    avatarUrl: "https://example.com/avatar2.jpg"
  },
];