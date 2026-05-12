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