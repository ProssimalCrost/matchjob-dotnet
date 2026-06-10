import { api } from './api';
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from '@/src/types/message';

export async function getMyConversations(userId: string): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>(`/conversations/user/${userId}`);
  return data;
}

export async function createOrGetConversation(
  payload: CreateConversationRequest,
): Promise<Conversation> {
  const { data } = await api.post<Conversation>('/conversations', payload);
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/messages/${conversationId}`);
  return data;
}

export async function sendMessage(payload: SendMessageRequest): Promise<Message> {
  const { data } = await api.post<Message>('/messages', payload);
  return data;
}
