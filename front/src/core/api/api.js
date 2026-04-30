// services/api.js
// HTTP client for the MatchJob .NET API.
// The back-end keeps PascalCase JSON names, so requests and responses here do too.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://localhost:5000';

export const TOKEN_KEY = '@matchjob:token';
export const USER_KEY = '@matchjob:user';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const emptyToUndefined = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

export const getApiErrorMessage = (error, fallback = 'Nao foi possivel concluir a operacao.') => {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (data?.title) return data.title;
  if (data?.Title) return data.Title;
  if (error?.message) return error.message;

  return fallback;
};

export const isUnauthorizedError = (error) => error?.response?.status === 401;

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isUnauthorizedError(error)) {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }

    return Promise.reject(error);
  }
);

export const authRegister = (name, email, password, role) =>
  api.post('/auth/register', {
    Name: name,
    Email: email,
    Password: password,
    Role: role,
  });

export const authLogin = (email, password) =>
  api.post('/auth/login', {
    Email: email,
    Password: password,
  });

export const listProfessionals = (filters = {}) =>
  api.get('/professionals', {
    params: cleanParams({
      category: filters.category,
      location: filters.location,
      tag: filters.tag,
    }),
  });

export const getProfessionalById = (id) => api.get(`/professionals/${id}`);

export const createProfile = (userId, data) =>
  api.post('/professionals', {
    Description: emptyToUndefined(data.description),
    Category: data.category,
    Tags: Array.isArray(data.tags) ? data.tags : [],
    Location: emptyToUndefined(data.location),
    PriceRange: emptyToUndefined(data.priceRange),
  }, {
    params: { userId },
  });

export const createConversation = (clientId, professionalId) =>
  api.post('/conversations', {
    ClientId: clientId,
    ProfessionalId: professionalId,
  });

export const getConversations = (userId) => api.get(`/conversations/user/${userId}`);

export const sendMessage = (conversationId, senderId, content) =>
  api.post('/messages', {
    ConversationId: conversationId,
    SenderId: senderId,
    Content: content,
  });

export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);

export const createReview = (professionalProfileId, rating, comment) =>
  api.post('/api/reviews', {
    ProfessionalProfileId: professionalProfileId,
    Rating: rating,
    Comment: emptyToUndefined(comment),
  });

export const getReviewsByProfessional = (professionalProfileId) =>
  api.get(`/api/reviews/professional/${professionalProfileId}`);

export const getProfessionalAverageRating = (professionalProfileId) =>
  api.get(`/api/reviews/professional/${professionalProfileId}/average`);

export default api;
