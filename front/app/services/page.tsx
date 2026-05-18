"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import {
  getServiceRequests,
  updateServiceStatus,
  deleteServiceRequest,
} from "@/src/features/services/services/serviceService";
import type {
  ServiceRequest,
  ServiceStatus,
} from "@/src/features/services/types/serviceTypes";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  InboxArrowDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ServiceStatus, string> = {
  Pending: "Aguardando",
  Accepted: "Aceito",
  InProgress: "Em andamento",
  Completed: "Concluído",
  Canceled: "Cancelado",
  Rejected: "Recusado",
};

const STATUS_STYLE: Record<ServiceStatus, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-200",
  InProgress: "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Canceled: "bg-slate-50 text-slate-500 border-slate-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "hired" | "providing" | "received" | "sent";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "hired",
    label: "Contratei",
    icon: <BriefcaseIcon className="h-4 w-4" />,
  },
  {
    id: "providing",
    label: "Estou prestando",
    icon: <CheckCircleIcon className="h-4 w-4" />,
  },
  {
    id: "received",
    label: "Solicitações recebidas",
    icon: <InboxArrowDownIcon className="h-4 w-4" />,
  },
  {
    id: "sent",
    label: "Solicitações enviadas",
    icon: <PaperAirplaneIcon className="h-4 w-4" />,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("hired");
  const [error, setError] = useState<string | null>(null);

  // Simula o userId do usuário logado (normalmente viria do JWT decodificado)
  const currentUserId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const token = localStorage.getItem("matchjob_token");
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
        })()
      : null;

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceRequests();
      setServices(data);
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number } })?.response?.status;

      // 401: o interceptor do api.ts já faz o redirect para /login.
      // Não exibimos o estado de erro para não piscar a tela antes do redirect.
      if (status === 401) return;

      console.error(err);

      if (status === 404) {
        setError(
          "O endpoint /service-requests ainda não existe no backend. Implemente-o para ativar esta página."
        );
      } else {
        setError(
          "Não foi possível carregar os serviços. Verifique se o backend está rodando."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleStatusChange(
    id: string,
    status: ServiceStatus
  ) {
    try {
      await updateServiceStatus(id, status);
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch {
      alert("Erro ao atualizar status.");
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancelar esta solicitação?")) return;
    try {
      await deleteServiceRequest(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Erro ao cancelar solicitação.");
    }
  }

  function goToChat(professionalId?: string, clientId?: string) {
    const participantId = professionalId || clientId;
    if (participantId) {
      router.push(`/chat?participantId=${participantId}`);
    } else {
      router.push("/chat");
    }
  }

  // Filtra os serviços por aba
  const filtered = services.filter((s) => {
    if (activeTab === "hired") return s.clientId === currentUserId;
    if (activeTab === "providing")
      return (
        s.professionalId === currentUserId &&
        ["Accepted", "InProgress", "Completed"].includes(s.status)
      );
    if (activeTab === "received")
      return s.professionalId === currentUserId && s.status === "Pending";
    if (activeTab === "sent")
      return s.clientId === currentUserId && s.status === "Pending";
    return false;
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-20 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Serviços</h1>
              <p className="mt-2 text-slate-500">
                Gerencie os serviços que você contratou ou está prestando.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:text-purple-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={loadServices} />
            ) : filtered.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="space-y-4">
                {filtered.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    tab={activeTab}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancel}
                    onOpenChat={goToChat}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-3xl bg-slate-200"
        />
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <XCircleIcon className="mx-auto h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-bold text-slate-900">
        Não foi possível carregar
      </h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
      >
        <ArrowPathIcon className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, string> = {
    hired: "Você ainda não contratou nenhum serviço.",
    providing: "Você não tem serviços em andamento.",
    received: "Nenhuma solicitação recebida no momento.",
    sent: "Você não enviou nenhuma solicitação.",
  };

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <ClockIcon className="mx-auto h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-bold text-slate-900">
        Nada por aqui ainda
      </h3>
      <p className="mt-2 text-sm text-slate-500">{messages[tab]}</p>
    </div>
  );
}

type ServiceCardProps = {
  service: ServiceRequest;
  tab: Tab;
  onStatusChange: (id: string, status: ServiceStatus) => void;
  onCancel: (id: string) => void;
  onOpenChat: (professionalId?: string, clientId?: string) => void;
};

function ServiceCard({
  service,
  tab,
  onStatusChange,
  onCancel,
  onOpenChat,
}: ServiceCardProps) {
  const isClient = tab === "hired" || tab === "sent";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {service.title}
            </h3>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${STATUS_STYLE[service.status]}`}
            >
              {STATUS_LABEL[service.status]}
            </span>
          </div>

          <p className="mt-1 text-sm text-purple-700 font-medium">
            {isClient
              ? `Profissional: ${service.professionalName || "Não informado"}`
              : `Cliente: ${service.clientName || "Não informado"}`}
          </p>

          <p className="mt-3 text-sm text-slate-600">{service.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            {service.priceAgreed && (
              <span className="font-medium text-slate-700">
                💰 {service.priceAgreed}
              </span>
            )}
            {service.scheduledDate && (
              <span>
                📅{" "}
                {new Date(service.scheduledDate).toLocaleDateString("pt-BR")}
              </span>
            )}
            {service.location && <span>📍 {service.location}</span>}
            <span>
              Criado em{" "}
              {new Date(service.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <button
          onClick={() =>
            onOpenChat(service.professionalId, service.clientId)
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-300 hover:text-purple-700"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          Abrir chat
        </button>

        {/* Ações para solicitações recebidas */}
        {tab === "received" && (
          <>
            <button
              onClick={() => onStatusChange(service.id, "Accepted")}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Aceitar
            </button>
            <button
              onClick={() => onStatusChange(service.id, "Rejected")}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <XCircleIcon className="h-4 w-4" />
              Recusar
            </button>
          </>
        )}

        {/* Ações para serviços que estou prestando */}
        {tab === "providing" && service.status === "Accepted" && (
          <button
            onClick={() => onStatusChange(service.id, "InProgress")}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Iniciar serviço
          </button>
        )}

        {tab === "providing" && service.status === "InProgress" && (
          <button
            onClick={() => onStatusChange(service.id, "Completed")}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Marcar como concluído
          </button>
        )}

        {/* Cancelar (cliente) */}
        {(tab === "hired" || tab === "sent") &&
          ["Pending", "Accepted"].includes(service.status) && (
            <button
              onClick={() => onCancel(service.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <XCircleIcon className="h-4 w-4" />
              Cancelar
            </button>
          )}
      </div>
    </article>
  );
}
