export type Conversation = {
  id: string;
  clientId: string;
  clientName?: string;
  professionalId: string;
  professionalName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  readAt?: string;
  createdAt: string;
};

export type SendMessageRequest = {
  senderId: string;
  content: string;
};

export type CreateConversationRequest = {
  clientId: string;
  professionalId: string;
};
