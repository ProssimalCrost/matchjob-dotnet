import { PagedResult } from './common';

export interface Tag {
  Id: string;
  Name: string;
  Slug: string | null;
}

export interface Professional {
  Id: string;
  UserId: string;
  UserName: string;
  UserEmail: string;
  Title: string | null;
  Bio: string | null;
  Description: string | null;
  CategoryId: string;
  Category: string;
  Tags: Tag[];
  Location: string | null;
  PriceRange: string | null;
  Price: number | null;
  AvatarUrl: string | null;
  Available: boolean;
  Rating: number;
  ReviewCount: number;
}

export type PagedProfessionals = PagedResult<Professional>;

export interface ProfessionalFilters {
  Search?: string;
  Category?: string;
  Location?: string;
  Tag?: string;
  MinRating?: number;
  Available?: boolean;
  Page?: number;
  PageSize?: number;
}

export interface CreateMyProfileRequest {
  Title?: string;
  Bio?: string;
  Description?: string;
  CategoryId: string;
  TagIds: string[];
  Location?: string;
  PriceRange?: string;
  Price?: number;
  AvatarUrl?: string;
  Available: boolean;
}

export interface UpdateMyProfileRequest {
  Title?: string;
  Bio?: string;
  Description?: string;
  CategoryId: string;
  TagIds: string[];
  Location?: string;
  PriceRange?: string;
  Price?: number;
  AvatarUrl?: string;
  Available: boolean;
}
