import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, sendMessage } from '@/src/services/messageService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Message } from '@/src/types/message';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMessages(id)
      .then((msgs) => setMessages(msgs.reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSend() {
    if (!text.trim() || !id || !user) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await sendMessage({ ConversationId: id, SenderId: user.UserId, Content: content });
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { setText(content); }
    finally { setSending(false); }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        className="flex-row justify-between items-center bg-slate-950 border-b border-slate-800 px-3 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-white text-base font-semibold">Conversa</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="mt-10" />
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.Id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isOwn = item.SenderId === user?.UserId;
            return (
              <View className={`max-w-[78%] rounded-2xl p-3 ${isOwn ? 'self-end bg-primary rounded-br' : 'self-start bg-slate-800 rounded-bl'}`}>
                {!isOwn && (
                  <Text className="text-slate-400 text-[11px] font-semibold mb-0.5">{item.SenderName}</Text>
                )}
                <Text className={`text-sm leading-5 ${isOwn ? 'text-white' : 'text-slate-100'}`}>{item.Content}</Text>
                <Text className={`text-[10px] mt-1 self-end ${isOwn ? 'text-violet-300' : 'text-slate-500'}`}>
                  {new Date(item.CreatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View
        className="flex-row items-end gap-2.5 bg-slate-900 border-t border-slate-800 px-4 pt-3"
        style={{ paddingBottom: insets.bottom || 12 }}
      >
        <TextInput
          className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white max-h-[120px]"
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#64748b"
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          className={`w-11 h-11 rounded-full bg-primary items-center justify-center ${(!text.trim() || sending) ? 'opacity-50' : ''}`}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#ffffff" />
            : <Ionicons name="send" size={18} color="#ffffff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
