"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import { api } from "@/src/core/api/api";
import { removeToken } from "@/src/shared/utils/token";
import {
  UserIcon,
  BriefcaseIcon,
  BellIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserAccount = {
  id: string;
  userName: string;
  email: string;
};

type NotificationPrefs = {
  messages: boolean;
  newRequests: boolean;
  reviews: boolean;
  emailUpdates: boolean;
};

type PrivacyPrefs = {
  showFullLocation: boolean;
  showPhone: boolean;
  allowDirectContact: boolean;
  appearInSearch: boolean;
};

// ─── Seções ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "account", label: "Conta", icon: UserIcon },
  { id: "professional", label: "Perfil profissional", icon: BriefcaseIcon },
  { id: "notifications", label: "Notificações", icon: BellIcon },
  { id: "privacy", label: "Privacidade", icon: LockClosedIcon },
  { id: "security", label: "Segurança", icon: ShieldCheckIcon },
  { id: "support", label: "Ajuda e suporte", icon: QuestionMarkCircleIcon },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("account");
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get<UserAccount>("/auth/profile");
        setUser(res.data);
      } catch {
        // Silencia o erro — o interceptor já faz redirect em 401
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-20 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                Configurações
              </h1>
              <p className="mt-2 text-slate-500">
                Gerencie sua conta, preferências e privacidade.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              {/* Menu lateral */}
              <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm h-fit">
                <ul className="space-y-1">
                  {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const active = activeSection === section.id;

                    return (
                      <li key={section.id}>
                        <button
                          onClick={() => setActiveSection(section.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">
                            {section.label}
                          </span>
                          {!active && (
                            <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Conteúdo */}
              <div>
                {activeSection === "account" && (
                  <AccountSection
                    user={user}
                    loading={loadingUser}
                    onLogout={handleLogout}
                  />
                )}
                {activeSection === "professional" && (
                  <ProfessionalSection router={router} />
                )}
                {activeSection === "notifications" && <NotificationsSection />}
                {activeSection === "privacy" && <PrivacySection />}
                {activeSection === "security" && (
                  <SecuritySection onLogout={handleLogout} />
                )}
                {activeSection === "support" && <SupportSection />}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Account ──────────────────────────────────────────────────────────────────

function AccountSection({
  user,
  loading,
  onLogout,
}: {
  user: UserAccount | null;
  loading: boolean;
  onLogout: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      setChangingPassword(true);
      await api.patch("/auth/change-password", { newPassword });
      alert("Senha alterada com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      alert("Erro ao alterar senha.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Informações da conta"
        description="Seus dados básicos de acesso."
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nome
              </label>
              <input
                defaultValue={user?.userName ?? ""}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                defaultValue={user?.email ?? ""}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Nome e e-mail não podem ser alterados diretamente.
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Alterar senha">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nova senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
          >
            {changingPassword ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Zona de perigo">
        <div className="space-y-3">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sair da conta
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <TrashIcon className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Excluir conta</p>
                <p className="mt-1 text-sm text-red-600">
                  Esta ação é irreversível. Todos os seus dados serão
                  permanentemente removidos.
                </p>
                <button className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  Solicitar exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Professional ─────────────────────────────────────────────────────────────

function ProfessionalSection({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  const [available, setAvailable] = useState(true);
  const [visible, setVisible] = useState(true);

  return (
    <SectionCard
      title="Perfil profissional"
      description="Configure a visibilidade e disponibilidade do seu perfil."
    >
      <div className="mb-6">
        <ToggleRow
          label="Perfil visível"
          description="Quando desativado, seu perfil não aparece nas buscas."
          checked={visible}
          onChange={setVisible}
        />
        <ToggleRow
          label="Disponível para novos serviços"
          description="Indica que você está aceitando novas solicitações."
          checked={available}
          onChange={setAvailable}
        />
      </div>

      <button
        onClick={() => router.push("/professionals/profile/edit")}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
      >
        <BriefcaseIcon className="h-4 w-4" />
        Editar perfil profissional
      </button>
    </SectionCard>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    messages: true,
    newRequests: true,
    reviews: true,
    emailUpdates: false,
  });

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SectionCard
      title="Notificações"
      description="Escolha o que você quer ser notificado."
    >
      <ToggleRow
        label="Mensagens"
        description="Notificar ao receber novas mensagens no chat."
        checked={prefs.messages}
        onChange={() => toggle("messages")}
      />
      <ToggleRow
        label="Novas solicitações"
        description="Notificar quando alguém solicitar seu serviço."
        checked={prefs.newRequests}
        onChange={() => toggle("newRequests")}
      />
      <ToggleRow
        label="Avaliações"
        description="Notificar quando receber uma nova avaliação."
        checked={prefs.reviews}
        onChange={() => toggle("reviews")}
      />
      <ToggleRow
        label="Atualizações por e-mail"
        description="Receber e-mails sobre novidades e recursos do MatchJob."
        checked={prefs.emailUpdates}
        onChange={() => toggle("emailUpdates")}
      />
    </SectionCard>
  );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

function PrivacySection() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>({
    showFullLocation: false,
    showPhone: false,
    allowDirectContact: true,
    appearInSearch: true,
  });

  function toggle(key: keyof PrivacyPrefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SectionCard
      title="Privacidade"
      description="Controle o que outros usuários podem ver sobre você."
    >
      <ToggleRow
        label="Mostrar localização completa"
        description="Quando desativado, exibe apenas a cidade."
        checked={prefs.showFullLocation}
        onChange={() => toggle("showFullLocation")}
      />
      <ToggleRow
        label="Mostrar telefone/WhatsApp"
        description="Exibir número de contato no perfil público."
        checked={prefs.showPhone}
        onChange={() => toggle("showPhone")}
      />
      <ToggleRow
        label="Permitir contato direto"
        description="Outros usuários podem iniciar uma conversa com você."
        checked={prefs.allowDirectContact}
        onChange={() => toggle("allowDirectContact")}
      />
      <ToggleRow
        label="Aparecer em buscas"
        description="Seu perfil pode ser encontrado na pesquisa do Dashboard."
        checked={prefs.appearInSearch}
        onChange={() => toggle("appearInSearch")}
      />
    </SectionCard>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────

function SecuritySection({ onLogout }: { onLogout: () => void }) {
  return (
    <SectionCard
      title="Segurança"
      description="Gerencie o acesso à sua conta."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Sessão ativa</p>
          <p className="mt-1 text-xs text-slate-500">
            Você está logado neste dispositivo. Sessões múltiplas serão
            exibidas aqui futuramente.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Encerrar sessão
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────

function SupportSection() {
  return (
    <div className="space-y-4">
      <SectionCard
        title="Ajuda e suporte"
        description="Precisa de ajuda? Entre em contato com a nossa equipe."
      >
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white">
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Suporte MatchJob</p>
              <p className="text-sm text-slate-600">
                Resposta em até 24 horas úteis
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
              E-mail de suporte
            </p>
            <p className="font-medium text-slate-900">
              theylonocaradati@gmail.com
            </p>
          </div>

          <a
            href="mailto:theylonocaradati@gmail.com"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Enviar e-mail de suporte
          </a>
        </div>
      </SectionCard>

      <SectionCard title="Sobre o MatchJob">
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            O MatchJob conecta clientes a profissionais autônomos de diversas
            categorias. Todo usuário pode contratar e prestar serviços
            simultaneamente.
          </p>
          <p className="text-xs text-slate-400 pt-2">
            Versão 1.0 — Desenvolvido com Next.js 16 + .NET 8
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
