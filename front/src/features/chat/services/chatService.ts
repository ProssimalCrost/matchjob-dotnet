import { api } from "@/src/core/api/api";
import type {
  Conversation,
  Message,
  SendMessageRequest,
  CreateConversationRequest,
} from "../types/chatTypes";

type ConversationResponse = {
  Id: string;
  ClientId: string;
  ClientName: string;
  ProfessionalId: string;
  ProfessionalName: string;
};

type MessageResponse = {
  Id: string;
  ConversationId: string;
  SenderId: string;
  SenderName: string;
  Content: string;
  CreatedAt: string;
};

function mapConversation(conversation: ConversationResponse): Conversation {
  return {
    id: conversation.Id,
    clientId: conversation.ClientId,
    clientName: conversation.ClientName,
    professionalId: conversation.ProfessionalId,
    professionalName: conversation.ProfessionalName,
  };
}

function mapMessage(message: MessageResponse): Message {
  return {
    id: message.Id,
    conversationId: message.ConversationId,
    senderId: message.SenderId,
    senderName: message.SenderName,
    content: message.Content,
    createdAt: message.CreatedAt,
  };
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const response = await api.get<ConversationResponse[]>(
    `/conversations/user/${userId}`
  );
  return response.data.map(mapConversation);
}

export async function createOrGetConversation(
  data: CreateConversationRequest
): Promise<Conversation> {
  const response = await api.post<ConversationResponse>("/conversations", {
    ClientId: data.clientId,
    ProfessionalId: data.professionalId,
  });
  return mapConversation(response.data);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const response = await api.get<MessageResponse[]>(`/messages/${conversationId}`);
  return response.data.map(mapMessage);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<Message> {
  const response = await api.post<MessageResponse>("/messages", {
    ConversationId: conversationId,
    SenderId: data.senderId,
    Content: data.content,
  });
  return mapMessage(response.data);
}

export async function markAsRead(conversationId: string): Promise<void> {
  void conversationId;
}
