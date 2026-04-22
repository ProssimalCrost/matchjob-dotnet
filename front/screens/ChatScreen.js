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

  const renderMsg = ({ item }) => {
    const isMe = item.SenderId === user.UserId;
    return (
      <View className={`mb-3 flex-row items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe ? (
          <View className="mr-2 h-[34px] w-[34px] items-center justify-center rounded-full bg-indigo-600">
            <Text className="text-xs font-extrabold text-white">
              {item.SenderName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : null}

        <View
          className={`max-w-[74%] rounded-2xl p-3 shadow-sm ${
            isMe ? 'rounded-br-[4px] bg-indigo-600' : 'rounded-bl-[4px] bg-white'
          }`}
        >
          {!isMe ? (
            <Text className="mb-1 text-[11px] font-bold text-indigo-600">
              {item.SenderName}
            </Text>
          ) : null}

          <Text className={`text-base leading-5 ${isMe ? 'text-white' : 'text-slate-900'}`}>
            {item.Content}
          </Text>
          <Text
            className={`mt-1 text-right text-[10px] ${
              isMe ? 'text-white/70' : 'text-slate-400'
            }`}
          >
            {formatTime(item.CreatedAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-indigo-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ flex: 1, marginTop: 60 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderMsg}
          contentContainerClassName="p-4 pb-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center pt-24">
              <Text className="text-base font-bold text-slate-600">
                Inicio da conversa com {otherName}
              </Text>
              <Text className="mt-1 text-sm text-slate-400">Diga ola!</Text>
            </View>
          }
        />
      )}

      <View className="flex-row items-end gap-2 border-t border-slate-200 bg-white p-3">
        <TextInput
          className="max-h-[120px] flex-1 rounded-full border border-slate-200 bg-indigo-50 px-4 py-3 text-sm text-slate-800"
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          className={`h-[46px] w-[46px] items-center justify-center rounded-full ${
            !text.trim() || sending ? 'bg-indigo-200' : 'bg-indigo-600'
          }`}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-base font-bold text-white">OK</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
