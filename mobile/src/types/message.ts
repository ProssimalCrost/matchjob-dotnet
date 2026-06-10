export interface Conversation {
  Id: string;
  ClientId: string;
  ClientName: string;
  ProfessionalId: string;
  ProfessionalName: string;
}

export interface Message {
  Id: string;
  ConversationId: string;
  SenderId: string;
  SenderName: string;
  Content: string;
  CreatedAt: string;
}

export interface CreateConversationRequest {
  ClientId: string;
  ProfessionalId: string;
}

export interface SendMessageRequest {
  ConversationId: string;
  SenderId: string;
  Content: string;
}
