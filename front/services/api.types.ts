import type { AxiosResponse } from 'axios';

export type Guid = string;
export type IsoDateTime = string;
export type UserRole = 'CLIENT' | 'PROFESSIONAL';

export interface User {
  Id: Guid;
  Name: string;
  Email: string;
  Password: string;
  Role: UserRole;
}

export interface UserSettings {
  Id: Guid;
  UserId: Guid;
  NotificationsEnabled: boolean;
  DarkMode: boolean;
}

export interface Category {
  Id: Guid;
  Name: string;
  Slug: string;
}

export interface Tag {
  Id: Guid;
  Name: string;
  Slug: string;
}

export interface ProfessionalTag {
  ProfessionalId: Guid;
  TagId: Guid;
}

export interface ProfessionalProfile {
  Id: Guid;
  UserId: Guid;
  Description: string | null;
  CategoryId: Guid;
  Title: string | null;
  Bio: string | null;
  Price: number | null;
  Available: boolean;
  AvatarUrl: string | null;
  Location: string | null;
  PriceRange: string | null;
  Rating: number;
}

export interface Conversation {
  Id: Guid;
  ClientId: Guid;
  ProfessionalId: Guid;
}

export interface Message {
  Id: Guid;
  ConversationId: Guid;
  SenderId: Guid;
  Content: string;
  CreatedAt: IsoDateTime;
}

export interface Review {
  Id: Guid;
  ReviewerId: Guid;
  ProfessionalProfileId: Guid;
  Rating: number;
  Comment: string | null;
  CreatedAt: IsoDateTime;
}

export interface RegisterRequest {
  Name: string;
  Email: string;
  Password: string;
  Role: UserRole;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface AuthResponse {
  Token: string;
  UserId: Guid;
  Name: string;
  Email: string;
  Role: UserRole;
}

export interface ProfessionalProfileRequest {
  Description?: string;
  Category: string;
  Tags: string[];
  Location?: string;
  PriceRange?: string;
}

export interface ProfessionalProfileResponse {
  Id: Guid;
  UserId: Guid;
  UserName: string;
  UserEmail: string;
  Description: string;
  Category: string;
  Tags: string[];
  Location: string | null;
  PriceRange: string | null;
  Rating: number;
}

export interface ProfessionalFilters {
  category?: string;
  location?: string;
  tag?: string;
}

export interface ConversationRequest {
  ClientId: Guid;
  ProfessionalId: Guid;
}

export interface ConversationResponse {
  Id: Guid;
  ClientId: Guid;
  ClientName: string;
  ProfessionalId: Guid;
  ProfessionalName: string;
}

export interface MessageRequest {
  ConversationId: Guid;
  SenderId: Guid;
  Content: string;
}

export interface MessageResponse {
  Id: Guid;
  ConversationId: Guid;
  SenderId: Guid;
  SenderName: string;
  Content: string;
  CreatedAt: IsoDateTime;
}

export interface CreateReviewRequest {
  ProfessionalProfileId: Guid;
  Rating: number;
  Comment?: string;
}

export interface ReviewResponse {
  Id: Guid;
  ReviewerId: Guid;
  ReviewerName: string;
  ProfessionalProfileId: Guid;
  Rating: number;
  Comment: string | null;
  CreatedAt: IsoDateTime;
}

export interface AverageRatingResponse {
  professionalProfileId: Guid;
  average: number;
}

export interface ApiErrorBody {
  message?: string;
  Message?: string;
  title?: string;
  Title?: string;
  errors?: Record<string, string[]>;
}

export declare const BASE_URL: string;
export declare const TOKEN_KEY: string;
export declare const USER_KEY: string;

export declare function getApiErrorMessage(error: unknown, fallback?: string): string;
export declare function isUnauthorizedError(error: unknown): boolean;

export declare function authRegister(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AxiosResponse<AuthResponse>>;

export declare function authLogin(
  email: string,
  password: string
): Promise<AxiosResponse<AuthResponse>>;

export declare function listProfessionals(
  filters?: ProfessionalFilters
): Promise<AxiosResponse<ProfessionalProfileResponse[]>>;

export declare function getProfessionalById(
  id: Guid
): Promise<AxiosResponse<ProfessionalProfileResponse | null>>;

export declare function createProfile(
  userId: Guid,
  data: {
    description?: string;
    category: string;
    tags?: string[];
    location?: string;
    priceRange?: string;
  }
): Promise<AxiosResponse<string>>;

export declare function createConversation(
  clientId: Guid,
  professionalId: Guid
): Promise<AxiosResponse<ConversationResponse>>;

export declare function getConversations(
  userId: Guid
): Promise<AxiosResponse<ConversationResponse[]>>;

export declare function sendMessage(
  conversationId: Guid,
  senderId: Guid,
  content: string
): Promise<AxiosResponse<MessageResponse>>;

export declare function getMessages(
  conversationId: Guid
): Promise<AxiosResponse<MessageResponse[]>>;

export declare function createReview(
  professionalProfileId: Guid,
  rating: number,
  comment?: string
): Promise<AxiosResponse<ReviewResponse>>;

export declare function getReviewsByProfessional(
  professionalProfileId: Guid
): Promise<AxiosResponse<ReviewResponse[]>>;

export declare function getProfessionalAverageRating(
  professionalProfileId: Guid
): Promise<AxiosResponse<AverageRatingResponse>>;
