import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppBackdrop, Panel, ResponsiveShell, SurfaceHeader, Tag, palette } from '../../../../shared/ui/MatchJobUI';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { getApiErrorMessage, getMessages, sendMessage } from '../../../../core/api/api';

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

  const loadMessages = useCallback(async (showError = false) => {
    try {
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } catch (err) {
      if (showError) {
        Alert.alert('Erro', getApiErrorMessage(err, 'Nao foi possivel carregar as mensagens.'));
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages(true);
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
      await loadMessages(true);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Nao foi possivel enviar a mensagem.'));
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

  return (
    <AppBackdrop>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ResponsiveShell maxWidth={1120}>
          <View style={{ paddingTop: 24, paddingBottom: 120, flex: 1 }}>
            <View style={{ marginBottom: 18 }}>
              <SurfaceHeader
                title={otherName}
                subtitle="Conversa ativa"
                action={
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Tag>Online</Tag>
                    <Tag>{messages.length} mensagens</Tag>
                  </View>
                }
              />
            </View>

            <Panel style={{ flex: 1, paddingBottom: 14 }}>
              {loading ? (
                <ActivityIndicator color={palette.primary} size="large" style={{ marginTop: 60 }} />
              ) : (
                <FlatList
                  ref={listRef}
                  data={messages}
                  keyExtractor={(item) => item.Id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 6 }}
                  renderItem={({ item }) => {
                    const isMe = item.SenderId === user.UserId;

                    return (
                      <View
                        style={{
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                          marginBottom: 14,
                        }}
                      >
                        <View
                          style={{
                            maxWidth: '82%',
                            borderRadius: 24,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            backgroundColor: isMe ? palette.primary : '#f3f4f6',
                          }}
                        >
                          {!isMe ? (
                            <Text
                              style={{
                                color: palette.primaryStrong,
                                fontSize: 12,
                                fontWeight: '800',
                                marginBottom: 6,
                              }}
                            >
                              {item.SenderName}
                            </Text>
                          ) : null}
                          <Text style={{ color: isMe ? '#fff' : palette.text, fontSize: 15, lineHeight: 23 }}>
                            {item.Content}
                          </Text>
                          <Text
                            style={{
                              color: isMe ? 'rgba(255,255,255,0.72)' : palette.textMuted,
                              fontSize: 11,
                              fontWeight: '700',
                              marginTop: 8,
                              textAlign: 'right',
                            }}
                          >
                            {formatTime(item.CreatedAt)}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 52 }}>
                      <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>
                        Comece a conversa
                      </Text>
                      <Text
                        style={{
                          color: palette.textMuted,
                          fontSize: 14,
                          lineHeight: 22,
                          marginTop: 10,
                          textAlign: 'center',
                          maxWidth: 320,
                        }}
                      >
                        Escreva a primeira mensagem para abrir o contato com {otherName}.
                      </Text>
                    </View>
                  }
                />
              )}
            </Panel>
          </View>
        </ResponsiveShell>

        <View
          style={{
            position: 'absolute',
            bottom: 18,
            left: 20,
            right: 20,
            alignSelf: 'center',
            maxWidth: 1120,
          }}
        >
          <Panel style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
              <TextInput
                style={{
                  flex: 1,
                  minHeight: 54,
                  maxHeight: 120,
                  borderRadius: 8,
                  backgroundColor: '#f4f6ff',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: palette.text,
                  fontSize: 15,
                  textAlignVertical: 'top',
                }}
                placeholder="Digite sua mensagem"
                placeholderTextColor="#98a0c9"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: !text.trim() || sending ? '#c7cff4' : palette.primary,
                  borderRadius: 8,
                  minHeight: 54,
                  paddingHorizontal: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleSend}
                disabled={!text.trim() || sending}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                  {sending ? '...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </Panel>
        </View>
      </KeyboardAvoidingView>
    </AppBackdrop>
  );
}
