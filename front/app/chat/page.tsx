"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  createOrGetConversation,
} from "@/src/features/chat/services/chatService";
import type {
  Conversation,
  Message,
} from "@/src/features/chat/types/chatTypes";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { getToken } from "@/src/shared/utils/token";

// Decodifica o userId do JWT
function getCurrentUserId(): string | null {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload.sub ||
      payload.nameid ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      null
    );
  } catch {
    return null;
  }
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const participantIdParam = searchParams.get("participantId");
  const clientIdParam = searchParams.get("clientId");
  const professionalIdParam = searchParams.get("professionalId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true); // mobile: mostra lista ou chat

  const currentUserId = getCurrentUserId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático para o final das mensagens
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carrega as conversas
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
      console.error("Erro ao carregar conversas:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Se veio de outra tela com ids na URL, cria/abre conversa
  useEffect(() => {
    const clientId = clientIdParam ?? currentUserId;
    const professionalId = professionalIdParam ?? participantIdParam;

    if (!professionalId || !currentUserId || loadingConversations) return;

    async function openOrCreateConversation() {
      try {
        const conversation = await createOrGetConversation({
          clientId: clientId!,
          professionalId: professionalId!,
        });
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conversation.id);
          return exists ? prev : [conversation, ...prev];
        });
        selectConversation(conversation);
      } catch (err) {
        console.error("Erro ao criar conversa:", err);
      }
    }

    openOrCreateConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    participantIdParam,
    clientIdParam,
    professionalIdParam,
    currentUserId,
    loadingConversations,
  ]);

  async function selectConversation(conversation: Conversation) {
    setSelectedConversation(conversation);
    setShowList(false);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const data = await getMessages(conversation.id);
      setMessages(data);
      await markAsRead(conversation.id);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    } finally {
      setLoadingMessages(false);
      inputRef.current?.focus();
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation || !currentUserId || sending) {
      return;
    }

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
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
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? sent : m))
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: content, lastMessageAt: sent.createdAt }
            : c
        )
      );
    } catch {
      // Remove a mensagem temporária em caso de erro
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(content);
      alert("Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  function getOtherParticipantName(conversation: Conversation): string {
    if (!currentUserId) return "Usuário";
    if (conversation.clientId === currentUserId) {
      return conversation.professionalName || "Usuário";
    }
    return conversation.clientName || "Usuário";
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR");
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden">
          {/* Lista de conversas */}
          <aside
            className={`flex h-full w-full flex-col border-r border-slate-200 bg-white lg:w-80 lg:flex ${
              showList ? "flex" : "hidden"
            }`}
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h1 className="text-xl font-bold text-slate-900">Mensagens</h1>
              <p className="text-sm text-slate-500">
                {conversations.length} conversa(s)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Nenhuma conversa ainda. Acesse um profissional e clique em
                    &ldquo;Enviar mensagem&rdquo;.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {conversations.map((conversation) => {
                    const name = getOtherParticipantName(conversation);
                    const isSelected =
                      selectedConversation?.id === conversation.id;

                    return (
                      <li key={conversation.id}>
                        <button
                          onClick={() => selectConversation(conversation)}
                          className={`flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 ${
                            isSelected ? "bg-purple-50" : ""
                          }`}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-lg font-bold text-white">
                            {getInitial(name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-semibold ${isSelected ? "text-purple-700" : "text-slate-900"}`}
                              >
                                {name}
                              </span>

                              {conversation.lastMessageAt && (
                                <span className="text-xs text-slate-400">
                                  {formatDate(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="truncate text-sm text-slate-500">
                                {conversation.lastMessage ||
                                  "Nenhuma mensagem"}
                              </p>

                              {(conversation.unreadCount ?? 0) > 0 && (
                                <span className="ml-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Janela de conversa */}
          <section
            className={`flex h-full flex-1 flex-col ${
              !showList ? "flex" : "hidden lg:flex"
            }`}
          >
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-slate-300" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Selecione uma conversa
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Escolha uma conversa à esquerda para começar.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header da conversa */}
                <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <button
                    onClick={() => setShowList(true)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 font-bold text-white">
                    {getInitial(getOtherParticipantName(selectedConversation))}
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      {getOtherParticipantName(selectedConversation)}
                    </h2>
                    <p className="text-xs text-slate-500">Online</p>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-4">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
                        >
                          <div className="h-10 w-48 animate-pulse rounded-2xl bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-slate-500">
                        Sem mensagens ainda. Diga olá!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => {
                        const isOwn = message.senderId === currentUserId;
                        const showTime =
                          index === messages.length - 1 ||
                          messages[index + 1]?.senderId !== message.senderId;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? "rounded-br-md bg-purple-600 text-white"
                                  : "rounded-bl-md bg-white text-slate-900 shadow-sm"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                              {showTime && (
                                <p
                                  className={`mt-1 text-right text-xs ${
                                    isOwn
                                      ? "text-purple-200"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input de mensagem */}
                <div className="border-t border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Digite uma mensagem..."
                      className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-center text-xs text-slate-400">
                    Enter para enviar
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
