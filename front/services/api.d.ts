import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  AverageRatingResponse,
  ConversationResponse,
  Guid,
  MessageResponse,
  ProfessionalFilters,
  ProfessionalProfileResponse,
  ReviewResponse,
  UserRole,
} from './api.types';

export * from './api.types';

export const BASE_URL: string;
export const TOKEN_KEY: string;
export const USER_KEY: string;
export const api: AxiosInstance;

export function getApiErrorMessage(error: unknown, fallback?: string): string;
export function isUnauthorizedError(error: unknown): boolean;

export function authRegister(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AxiosResponse<AuthResponse>>;

export function authLogin(
  email: string,
  password: string
): Promise<AxiosResponse<AuthResponse>>;

export function listProfessionals(
  filters?: ProfessionalFilters
): Promise<AxiosResponse<ProfessionalProfileResponse[]>>;

export function getProfessionalById(
  id: Guid
): Promise<AxiosResponse<ProfessionalProfileResponse | null>>;

export function createProfile(
  userId: Guid,
  data: {
    description?: string;
    category: string;
    tags?: string[];
    location?: string;
    priceRange?: string;
  }
): Promise<AxiosResponse<string>>;

export function createConversation(
  clientId: Guid,
  professionalId: Guid
): Promise<AxiosResponse<ConversationResponse>>;

export function getConversations(
  userId: Guid
): Promise<AxiosResponse<ConversationResponse[]>>;

export function sendMessage(
  conversationId: Guid,
  senderId: Guid,
  content: string
): Promise<AxiosResponse<MessageResponse>>;

export function getMessages(
  conversationId: Guid
): Promise<AxiosResponse<MessageResponse[]>>;

export function createReview(
  professionalProfileId: Guid,
  rating: number,
  comment?: string
): Promise<AxiosResponse<ReviewResponse>>;

export function getReviewsByProfessional(
  professionalProfileId: Guid
): Promise<AxiosResponse<ReviewResponse[]>>;

export function getProfessionalAverageRating(
  professionalProfileId: Guid
): Promise<AxiosResponse<AverageRatingResponse>>;

export default api;
