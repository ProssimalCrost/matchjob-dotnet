import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../services/AuthContext';
import { getMessages, sendMessage } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherName });
  }, [navigation, otherName]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(conversationId, user.UserId, content);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.SenderId === user.UserId;

    return (
      <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-[78%] rounded-[24px] px-4 py-3 ${
            isMe ? 'rounded-tr-[8px] bg-slate-950' : 'rounded-tl-[8px] bg-white'
          }`}
        >
          {!isMe ? (
            <Text className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-teal-700">
              {item.SenderName}
            </Text>
          ) : null}

          <Text className={`text-base leading-6 ${isMe ? 'text-white' : 'text-slate-800'}`}>
            {item.Content}
          </Text>

          <Text className={`mt-2 text-right text-[10px] font-semibold ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
            {formatTime(item.CreatedAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#edf4f7]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View className="border-b border-slate-200 bg-white px-4 py-3">
        <View className="w-full self-center" style={{ maxWidth: 1100 }}>
          <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            Conversa ativa
          </Text>
          <Text className="mt-1 text-lg font-black text-slate-900">{otherName}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#0f766e" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderMessage}
          contentContainerClassName="px-4 pb-3 pt-4"
          contentContainerStyle={{ width: '100%', maxWidth: 1100, alignSelf: 'center' }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center rounded-[28px] bg-white px-8 py-12">
              <Text className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Inicio da conversa
              </Text>
              <Text className="mt-4 text-center text-lg font-black text-slate-700">
                Escreva a primeira mensagem para {otherName}
              </Text>
            </View>
          }
        />
      )}

      <View className="border-t border-slate-200 bg-white px-3 pb-4 pt-3">
        <View className="w-full self-center flex-row items-end gap-2" style={{ maxWidth: 1100 }}>
          <TextInput
            className="max-h-[120px] flex-1 rounded-[24px] bg-slate-100 px-4 py-3.5 text-base text-slate-900"
            placeholder="Digite sua mensagem"
            placeholderTextColor="#94a3b8"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            className={`h-[52px] w-[52px] items-center justify-center rounded-full ${
              !text.trim() || sending ? 'bg-slate-300' : 'bg-teal-700'
            }`}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-xs font-black uppercase tracking-[0.15em] text-white">
                Enviar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
