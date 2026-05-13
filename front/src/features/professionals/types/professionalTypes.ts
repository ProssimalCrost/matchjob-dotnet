export interface Professional {
  Id: string;
  UserId: string;
  UserName: string;
  UserEmail: string;
  Description: string;
  Category: string;
  Tags: string[];
  Location: string;
  PriceRange: string;
  Rating: number;
  Status: "available" | "busy";
  AvatarUrl?: string;
}

export type ProfessionalFilters = {
  search?: string;
  category?: string;
  location?: string;
  tag?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
};

export type PagedProfessionalsResponse = {
  data: Professional[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UpdateProfessionalProfileRequest = {
  description: string;
  categoryId: string;
  location: string;
  priceRange: string;
  tagIds: string[];
};

export type EditProfessionalProfileForm = {
  description: string;
  categoryId: string;
  location: string;
  priceRange: string;
  tagIds: string[];
};