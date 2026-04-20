// services/api.js
// Camada de comunicação com o backend MatchJob (.NET)

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ TROQUE para o IP da sua máquina se estiver testando no celular físico
// Em emulador Android:  http://10.0.2.2:5000
// Em dispositivo físico: http://SEU_IP_LOCAL:5000
// Exemplo: http://192.168.1.100:5000
const BASE_URL = 'http://10.0.2.2:5000';

// Instância do axios com URL base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona o token JWT em toda requisição automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────
export const register = (name, email, password, role) =>
  api.post('/auth/register', { name, email, password, role });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ─── PROFISSIONAIS ────────────────────────────────────────
export const listProfessionals = (filters = {}) =>
  api.get('/professionals', { params: filters });

export const getProfessionalById = (id) =>
  api.get(`/professionals/${id}`);

export const createProfile = (userId, profileData) =>
  api.post(`/professionals?userId=${userId}`, profileData);

// ─── CONVERSAS ────────────────────────────────────────────
export const createConversation = (clientId, professionalId) =>
  api.post('/conversations', { clientId, professionalId });

export const getConversations = (userId) =>
  api.get(`/conversations/user/${userId}`);

// ─── MENSAGENS ────────────────────────────────────────────
export const sendMessage = (conversationId, senderId, content) =>
  api.post('/messages', { conversationId, senderId, content });

export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

export default api;
