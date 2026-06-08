import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  createOrGetConversation,
} from '@/src/features/chat/services/chatService';
import type { Conversation, Message } from '@/src/features/chat/types/chatTypes';
import { getToken, decodeUserIdFromToken } from '@/src/shared/utils/token';
import { Colors } from '@/src/shared/constants/colors';

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    participantId?: string;
    clientId?: string;
    professionalId?: string;
  }>();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    getToken().then((t) => setCurrentUserId(decodeUserIdFromToken(t)));
  }, []);

  const loadConversations = useCallback(async () => {
    if (!currentUserId) {
      setLoadingConversations(false);
      return;
    }
    try {
      setLoadingConversations(true);
      const data = await getConversations(currentUserId);
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // If navigated here with participant ids, create/open the conversation.
  useEffect(() => {
    const clientId = params.clientId ?? currentUserId ?? undefined;
    const professionalId = params.professionalId ?? params.participantId;
    if (!professionalId || !currentUserId || loadingConversations) return;

    (async () => {
      try {
        const conversation = await createOrGetConversation({
          clientId: clientId!,
          professionalId,
        });
        setConversations((prev) =>
          prev.find((c) => c.id === conversation.id) ? prev : [conversation, ...prev],
        );
        selectConversation(conversation);
      } catch (err) {
        console.error('Erro ao criar conversa:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.participantId, params.clientId, params.professionalId, currentUserId, loadingConversations]);

  async function selectConversation(conversation: Conversation) {
    setSelectedConversation(conversation);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const data = await getMessages(conversation.id);
      setMessages(data);
      await markAsRead(conversation.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation || !currentUserId || sending)
      return;
    const content = newMessage.trim();
    setNewMessage('');

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      setSending(true);
      const sent = await sendMessage(selectedConversation.id, {
        senderId: currentUserId,
        content,
      });
      setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? sent : m)));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: content, lastMessageAt: sent.createdAt }
            : c,
        ),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(content);
      Alert.alert('Erro', 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  }

  function getOtherParticipantName(c: Conversation): string {
    if (!currentUserId) return 'Usuário';
    if (c.clientId === currentUserId) return c.professionalName || 'Usuário';
    return c.clientName || 'Usuário';
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Conversation list view ──
  if (!selectedConversation) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
        <Sidebar />
        <View
          style={{ backgroundColor: Colors.surface, borderBottomColor: Colors.slate200 }}
          className="border-b px-5 py-4"
        >
          <Text style={{ color: Colors.text }} className="text-xl font-bold">
            Mensagens
          </Text>
          <Text style={{ color: Colors.textMuted }} className="text-sm">
            {conversations.length} conversa(s)
          </Text>
        </View>

        {loadingConversations ? (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{ backgroundColor: Colors.slate100, height: 64 }}
                className="rounded-2xl"
              />
            ))}
          </ScrollView>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 p-8">
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.slate300} />
            <Text style={{ color: Colors.textMuted }} className="text-center text-sm">
              Nenhuma conversa ainda. Acesse um profissional e clique em
              "Chamar / Contratar".
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: Colors.slate100 }} />
            )}
            renderItem={({ item: conversation }) => {
              const name = getOtherParticipantName(conversation);
              return (
                <Pressable
                  onPress={() => selectConversation(conversation)}
                  style={{ backgroundColor: Colors.surface }}
                  className="flex-row items-center gap-4 px-4 py-4"
                >
                  <View
                    style={{ backgroundColor: Colors.primary }}
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                  >
                    <Text className="text-lg font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.text }} className="font-semibold">
                      {name}
                    </Text>
                    <Text style={{ color: Colors.textMuted }} className="text-sm" numberOfLines={1}>
                      {conversation.lastMessage || 'Nenhuma mensagem'}
                    </Text>
                  </View>
                  {(conversation.unreadCount ?? 0) > 0 && (
                    <View
                      style={{ backgroundColor: Colors.primary }}
                      className="rounded-full px-2 py-0.5"
                    >
                      <Text className="text-xs font-bold text-white">
                        {conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ── Conversation window view ──
  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <View
        style={{ backgroundColor: Colors.surface, borderBottomColor: Colors.slate200 }}
        className="flex-row items-center gap-4 border-b px-4 py-3 pt-12"
      >
        <Pressable onPress={() => setSelectedConversation(null)} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.slate500} />
        </Pressable>
        <View
          style={{ backgroundColor: Colors.primary }}
          className="h-10 w-10 items-center justify-center rounded-2xl"
        >
          <Text className="font-bold text-white">
            {getOtherParticipantName(selectedConversation).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={{ color: Colors.text }} className="font-bold">
            {getOtherParticipantName(selectedConversation)}
          </Text>
          <Text style={{ color: Colors.textMuted }} className="text-xs">
            Online
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            !loadingMessages ? (
              <View className="items-center py-10">
                <Text style={{ color: Colors.textMuted }} className="text-sm">
                  Sem mensagens ainda. Diga olá!
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item: message }) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <View style={{ alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                <View
                  style={{
                    backgroundColor: isOwn ? Colors.primary : Colors.surface,
                    maxWidth: '78%',
                  }}
                  className="rounded-2xl px-4 py-3"
                >
                  <Text style={{ color: isOwn ? Colors.white : Colors.text }} className="text-sm">
                    {message.content}
                  </Text>
                  <Text
                    style={{ color: isOwn ? '#ddd6fe' : Colors.slate400 }}
                    className="mt-1 text-right text-xs"
                  >
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View
          style={{ backgroundColor: Colors.surface, borderTopColor: Colors.slate200 }}
          className="border-t px-4 py-3"
        >
          <View
            style={{ backgroundColor: Colors.slate100, borderColor: Colors.slate200 }}
            className="flex-row items-center gap-3 rounded-2xl border px-4 py-1"
          >
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={Colors.slate400}
              style={{ flex: 1, color: Colors.text, paddingVertical: 8 }}
              onSubmitEditing={handleSendMessage}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              style={{
                backgroundColor: Colors.primary,
                opacity: !newMessage.trim() || sending ? 0.5 : 1,
              }}
              className="h-8 w-8 items-center justify-center rounded-xl"
            >
              <Ionicons name="send" size={16} color={Colors.white} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
