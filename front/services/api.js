// services/api.js
// Comunicação com o backend MatchJob (.NET 8 — porta 5000)

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────
// ⚠️  AJUSTE A URL CONFORME SEU AMBIENTE:
//
//  Emulador Android  → http://10.0.2.2:5000
//  Simulador iOS     → http://localhost:5000
//  Celular físico    → http://SEU_IP_LOCAL:5000
//    (descubra com: ipconfig no Windows | ifconfig no Mac/Linux)
// ─────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de REQUEST: injeta o JWT em toda chamada ──
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@matchjob:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de RESPONSE: trata erros globais ──────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token expirado → limpa a sessão
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['@matchjob:token', '@matchjob:user']);
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// AUTH
// Nota: o .NET usa PascalCase no JSON (Name, Email, Password)
// ═══════════════════════════════════════════════════════════
export const authRegister = (name, email, password, role) =>
  api.post('/auth/register', {
    Name: name,
    Email: email,
    Password: password,
    Role: role,           // "CLIENT" ou "PROFESSIONAL"
  });

export const authLogin = (email, password) =>
  api.post('/auth/login', {
    Email: email,
    Password: password,
  });

// ═══════════════════════════════════════════════════════════
// PROFISSIONAIS
// ═══════════════════════════════════════════════════════════
export const listProfessionals = (filters = {}) =>
  api.get('/professionals', { params: filters });
  // filters: { category, location, tag } — todos opcionais

export const getProfessionalById = (id) =>
  api.get(`/professionals/${id}`);

export const createProfile = (userId, data) =>
  api.post(`/professionals?userId=${userId}`, {
    Description: data.description,
    Category:    data.category,
    Tags:        data.tags,
    Location:    data.location,
    PriceRange:  data.priceRange,
  });

// ═══════════════════════════════════════════════════════════
// CONVERSAS
// ═══════════════════════════════════════════════════════════
export const createConversation = (clientId, professionalId) =>
  api.post('/conversations', {
    ClientId:       clientId,
    ProfessionalId: professionalId,
  });

export const getConversations = (userId) =>
  api.get(`/conversations/user/${userId}`);

// ═══════════════════════════════════════════════════════════
// MENSAGENS
// ═══════════════════════════════════════════════════════════
export const sendMessage = (conversationId, senderId, content) =>
  api.post('/messages', {
    ConversationId: conversationId,
    SenderId:       senderId,
    Content:        content,
  });

export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

export default api;
