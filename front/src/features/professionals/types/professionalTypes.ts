export type TagDto = {
  Id: string;
  Name: string;
  Slug?: string;
};

export type Professional = {
  Id: string;
  UserId: string;
  UserName: string;
  UserEmail?: string;
  Title?: string;
  Bio?: string;
  Description?: string;
  CategoryId: string;
  Category: string;
  Tags: TagDto[];
  Location?: string;
  PriceRange?: string;
  Price?: number;
  AvatarUrl?: string;
  Available: boolean;
  Rating: number;
  ReviewCount: number;
};

export type ProfessionalFilters = {
  search?: string;
  category?: string;
  location?: string;
  tag?: string;
  minRating?: number;
  available?: boolean;
  page?: number;
  pageSize?: number;
};

export type PagedProfessionalsResponse = {
  Data: Professional[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
};

export type CreateMyProfileRequest = {
  title?: string;
  bio?: string;
  description?: string;
  categoryId: string;
  tagIds: string[];
  location?: string;
  priceRange?: string;
  price?: number;
  avatarUrl?: string;
  available: boolean;
};

export type UpdateProfessionalProfileRequest = {
  title?: string;
  bio?: string;
  description?: string;
  categoryId: string;
  tagIds: string[];
  location?: string;
  priceRange?: string;
  price?: number;
  avatarUrl?: string;
  available: boolean;
};
