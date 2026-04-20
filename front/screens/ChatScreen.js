// screens/ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { getMessages, sendMessage } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const listRef  = useRef(null);
  const pollRef  = useRef(null);

  // Define o título da tela com o nome do outro usuário
  useEffect(() => {
    navigation.setOptions({ title: `💬  ${otherName}` });
  }, [otherName]);

  // Carrega mensagens — os campos vêm em PascalCase do .NET:
  // Id, ConversationId, SenderId, SenderName, Content, CreatedAt
  const loadMessages = useCallback(async () => {
    try {
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } catch {
      // silencia erros de polling
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Polling a cada 3 segundos (simula tempo real)
  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  // Scroll para o final ao receber novas mensagens
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
      // SenderId = UserId do usuário logado (PascalCase para o .NET)
      await sendMessage(conversationId, user.UserId, content);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const renderMsg = ({ item }) => {
    const isMe = item.SenderId === user.UserId;
    return (
      <View style={[styles.row, isMe ? styles.rowMe : styles.rowOther]}>
        {!isMe && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>{item.SenderName?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {!isMe && <Text style={styles.senderName}>{item.SenderName}</Text>}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.Content}</Text>
          <Text style={[styles.time, isMe && styles.timeMe]}>
            {formatTime(item.CreatedAt)}
          </Text>
        </View>
      </View>
    );
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Lista de mensagens */}
      {loading
        ? <ActivityIndicator color="#4f46e5" size="large" style={styles.loader} />
        : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.Id.toString()}
            renderItem={renderMsg}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>Início da conversa com {otherName}</Text>
                <Text style={styles.emptySub}>Diga olá!</Text>
              </View>
            }
          />
        )
      }

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnOff]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendIcon}>➤</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  loader: { flex: 1, marginTop: 60 },
  msgList: { padding: 16, paddingBottom: 8 },

  row: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  rowMe: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  msgAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  msgAvatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  bubble: {
    maxWidth: '74%', borderRadius: 18, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1,
  },
  bubbleMe:    { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff',    borderBottomLeftRadius: 4 },

  senderName: { fontSize: 11, fontWeight: '700', color: '#4f46e5', marginBottom: 4 },
  msgText:    { fontSize: 15, color: '#1a1a2e', lineHeight: 21 },
  msgTextMe:  { color: '#fff' },
  time:       { fontSize: 10, color: '#bbb', marginTop: 5, textAlign: 'right' },
  timeMe:     { color: 'rgba(255,255,255,0.65)' },

  emptyWrap: { alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#555', textAlign: 'center' },
  emptySub:  { fontSize: 13, color: '#aaa', marginTop: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#fff', padding: 12, gap: 8,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1, backgroundColor: '#f0f4ff', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333',
    maxHeight: 120, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: '#c7d2fe' },
  sendIcon: { color: '#fff', fontSize: 18, marginLeft: 2 },
});
