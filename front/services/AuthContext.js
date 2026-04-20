// services/AuthContext.js
// Contexto global de autenticação — armazena o usuário logado e o token JWT

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// Chaves usadas no AsyncStorage
const TOKEN_KEY = '@matchjob:token';
const USER_KEY  = '@matchjob:user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // Dados do usuário logado
  const [loading, setLoading] = useState(true);   // Aguarda recuperar sessão salva

  // Ao abrir o app, verifica se há sessão salva
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // Sem sessão — começa deslogado
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Chamado após login ou cadastro bem-sucedido
  // authData vem direto da resposta do backend:
  // { Token, UserId, Name, Email, Role }
  const signIn = async (authData) => {
    await AsyncStorage.setItem(TOKEN_KEY, authData.Token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authData));
    setUser(authData);
  };

  // Limpa tudo e desloga
  const signOut = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto em qualquer tela
export const useAuth = () => useContext(AuthContext);
