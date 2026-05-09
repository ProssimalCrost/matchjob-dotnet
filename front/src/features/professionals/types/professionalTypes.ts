export interface Professional {
  id: string;
  name: string;
  title: string;
  bio?: string;
  category: string;
  location: string;
  price?: number;
  rating?: number;
  status: "available" | "busy";
  tags: string[];
  avatarUrl?: string;
}

export type ProfessionalFilters = {
  search?: string;
  location?: string;
  skill?: string;
};

