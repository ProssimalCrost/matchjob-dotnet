import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { api } from '@/src/core/api/api';
import { supabase } from '@/src/core/supabase/client';
import { removeToken } from '@/src/shared/utils/token';
import { Colors } from '@/src/shared/constants/colors';

type UserAccount = { id: string; userName: string; email: string };

type Section =
  | 'account'
  | 'professional'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'support';

const SECTIONS: { id: Section; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'account', label: 'Conta', icon: 'person-outline' },
  { id: 'professional', label: 'Perfil profissional', icon: 'briefcase-outline' },
  { id: 'notifications', label: 'Notificações', icon: 'notifications-outline' },
  { id: 'privacy', label: 'Privacidade', icon: 'lock-closed-outline' },
  { id: 'security', label: 'Segurança', icon: 'shield-checkmark-outline' },
  { id: 'support', label: 'Ajuda e suporte', icon: 'help-circle-outline' },
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{ borderBottomColor: Colors.slate100 }}
      className="flex-row items-center justify-between gap-4 border-b py-4"
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.text }} className="font-medium">
          {label}
        </Text>
        {!!description && (
          <Text style={{ color: Colors.textMuted }} className="text-sm">
            {description}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => onChange(!checked)}
        style={{
          backgroundColor: checked ? Colors.primary : Colors.slate300,
          width: 44,
          height: 24,
          borderRadius: 12,
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: Colors.white,
            alignSelf: checked ? 'flex-end' : 'flex-start',
          }}
        />
      </Pressable>
    </View>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
      className="rounded-3xl border p-6"
    >
      <Text style={{ color: Colors.text }} className="text-xl font-bold">
        {title}
      </Text>
      {!!description && (
        <Text style={{ color: Colors.textMuted }} className="mt-1 text-sm">
          {description}
        </Text>
      )}
      <View className="mt-4">{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [notif, setNotif] = useState({
    messages: true,
    newRequests: true,
    reviews: true,
    emailUpdates: false,
  });
  const [privacy, setPrivacy] = useState({
    showFullLocation: false,
    showPhone: false,
    allowDirectContact: true,
    appearInSearch: true,
  });
  const [available, setAvailable] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    api
      .get<UserAccount>('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    await removeToken();
    router.replace('/login');
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      setChangingPassword(true);
      await api.patch('/auth/change-password', { newPassword });
      Alert.alert('Pronto', 'Senha alterada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      Alert.alert('Erro', 'Erro ao alterar senha.');
    } finally {
      setChangingPassword(false);
    }
  }

  const inputStyle = {
    backgroundColor: Colors.slate100,
    borderColor: Colors.slate200,
    color: Colors.text,
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: Colors.text }} className="text-3xl font-bold">
          Configurações
        </Text>
        <Text style={{ color: Colors.textMuted }} className="mb-6 mt-2 text-sm">
          Gerencie sua conta, preferências e privacidade.
        </Text>

        {/* Section tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {SECTIONS.map((s) => {
              const active = activeSection === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setActiveSection(s.id)}
                  style={{
                    backgroundColor: active ? Colors.primary : Colors.surface,
                    borderColor: active ? Colors.primary : Colors.slate200,
                  }}
                  className="flex-row items-center gap-2 rounded-xl border px-4 py-2.5"
                >
                  <Ionicons
                    name={s.icon}
                    size={16}
                    color={active ? Colors.white : Colors.textSecondary}
                  />
                  <Text
                    style={{ color: active ? Colors.white : Colors.textSecondary }}
                    className="text-sm font-medium"
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {activeSection === 'account' && (
          <View className="gap-4">
            <Card title="Informações da conta" description="Seus dados básicos de acesso.">
              <View className="gap-4">
                <View>
                  <Text style={{ color: Colors.textSecondary }} className="mb-1.5 text-sm font-semibold">
                    Nome
                  </Text>
                  <TextInput
                    value={user?.userName ?? ''}
                    editable={false}
                    style={{ ...inputStyle, color: Colors.textMuted }}
                    className="rounded-2xl border px-4 py-3 text-sm"
                  />
                </View>
                <View>
                  <Text style={{ color: Colors.textSecondary }} className="mb-1.5 text-sm font-semibold">
                    E-mail
                  </Text>
                  <TextInput
                    value={user?.email ?? ''}
                    editable={false}
                    style={{ ...inputStyle, color: Colors.textMuted }}
                    className="rounded-2xl border px-4 py-3 text-sm"
                  />
                </View>
                <Text style={{ color: Colors.slate400 }} className="text-xs">
                  Nome e e-mail não podem ser alterados diretamente.
                  {loadingUser ? ' Carregando...' : ''}
                </Text>
              </View>
            </Card>

            <Card title="Alterar senha">
              <View className="gap-4">
                <View>
                  <Text style={{ color: Colors.textSecondary }} className="mb-1.5 text-sm font-semibold">
                    Nova senha
                  </Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.slate400}
                    style={inputStyle}
                    className="rounded-2xl border px-4 py-3 text-sm"
                  />
                </View>
                <View>
                  <Text style={{ color: Colors.textSecondary }} className="mb-1.5 text-sm font-semibold">
                    Confirmar nova senha
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Repita a senha"
                    placeholderTextColor={Colors.slate400}
                    style={inputStyle}
                    className="rounded-2xl border px-4 py-3 text-sm"
                  />
                </View>
                <Pressable
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                  style={{ backgroundColor: Colors.primary, alignSelf: 'flex-start', opacity: changingPassword ? 0.6 : 1 }}
                  className="rounded-2xl px-5 py-3"
                >
                  <Text className="text-sm font-semibold text-white">
                    {changingPassword ? 'Salvando...' : 'Salvar nova senha'}
                  </Text>
                </Pressable>
              </View>
            </Card>

            <Card title="Zona de perigo">
              <Pressable
                onPress={handleLogout}
                style={{ borderColor: Colors.slate200, alignSelf: 'flex-start' }}
                className="flex-row items-center gap-2 rounded-2xl border px-5 py-3"
              >
                <Ionicons name="log-out-outline" size={16} color={Colors.textSecondary} />
                <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">
                  Sair da conta
                </Text>
              </Pressable>
            </Card>
          </View>
        )}

        {activeSection === 'professional' && (
          <Card
            title="Perfil profissional"
            description="Configure a visibilidade e disponibilidade do seu perfil."
          >
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
            <Pressable
              onPress={() => router.push('/profile/edit')}
              style={{ backgroundColor: Colors.slate950, alignSelf: 'flex-start' }}
              className="mt-4 flex-row items-center gap-2 rounded-2xl px-5 py-3"
            >
              <Ionicons name="briefcase-outline" size={16} color={Colors.white} />
              <Text className="text-sm font-semibold text-white">
                Editar perfil profissional
              </Text>
            </Pressable>
          </Card>
        )}

        {activeSection === 'notifications' && (
          <Card title="Notificações" description="Escolha o que você quer ser notificado.">
            <ToggleRow
              label="Mensagens"
              description="Notificar ao receber novas mensagens no chat."
              checked={notif.messages}
              onChange={(v) => setNotif((p) => ({ ...p, messages: v }))}
            />
            <ToggleRow
              label="Novas solicitações"
              description="Notificar quando alguém solicitar seu serviço."
              checked={notif.newRequests}
              onChange={(v) => setNotif((p) => ({ ...p, newRequests: v }))}
            />
            <ToggleRow
              label="Avaliações"
              description="Notificar quando receber uma nova avaliação."
              checked={notif.reviews}
              onChange={(v) => setNotif((p) => ({ ...p, reviews: v }))}
            />
            <ToggleRow
              label="Atualizações por e-mail"
              description="Receber e-mails sobre novidades do MatchJob."
              checked={notif.emailUpdates}
              onChange={(v) => setNotif((p) => ({ ...p, emailUpdates: v }))}
            />
          </Card>
        )}

        {activeSection === 'privacy' && (
          <Card title="Privacidade" description="Controle o que outros usuários podem ver sobre você.">
            <ToggleRow
              label="Mostrar localização completa"
              description="Quando desativado, exibe apenas a cidade."
              checked={privacy.showFullLocation}
              onChange={(v) => setPrivacy((p) => ({ ...p, showFullLocation: v }))}
            />
            <ToggleRow
              label="Mostrar telefone/WhatsApp"
              description="Exibir número de contato no perfil público."
              checked={privacy.showPhone}
              onChange={(v) => setPrivacy((p) => ({ ...p, showPhone: v }))}
            />
            <ToggleRow
              label="Permitir contato direto"
              description="Outros usuários podem iniciar uma conversa com você."
              checked={privacy.allowDirectContact}
              onChange={(v) => setPrivacy((p) => ({ ...p, allowDirectContact: v }))}
            />
            <ToggleRow
              label="Aparecer em buscas"
              description="Seu perfil pode ser encontrado na pesquisa do Dashboard."
              checked={privacy.appearInSearch}
              onChange={(v) => setPrivacy((p) => ({ ...p, appearInSearch: v }))}
            />
          </Card>
        )}

        {activeSection === 'security' && (
          <Card title="Segurança" description="Gerencie o acesso à sua conta.">
            <View
              style={{ backgroundColor: Colors.slate100, borderColor: Colors.slate100 }}
              className="rounded-2xl border p-4"
            >
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">
                Sessão ativa
              </Text>
              <Text style={{ color: Colors.textMuted }} className="mt-1 text-xs">
                Você está logado neste dispositivo.
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              style={{ borderColor: Colors.slate200, alignSelf: 'flex-start' }}
              className="mt-4 flex-row items-center gap-2 rounded-2xl border px-5 py-3"
            >
              <Ionicons name="log-out-outline" size={16} color={Colors.textSecondary} />
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">
                Encerrar sessão
              </Text>
            </Pressable>
          </Card>
        )}

        {activeSection === 'support' && (
          <View className="gap-4">
            <Card
              title="Ajuda e suporte"
              description="Precisa de ajuda? Entre em contato com a nossa equipe."
            >
              <View
                style={{ backgroundColor: Colors.primary50, borderColor: Colors.primary100 }}
                className="rounded-2xl border p-5"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    style={{ backgroundColor: Colors.primary }}
                    className="h-10 w-10 items-center justify-center rounded-2xl"
                  >
                    <Ionicons name="help-circle-outline" size={20} color={Colors.white} />
                  </View>
                  <View>
                    <Text style={{ color: Colors.text }} className="font-semibold">
                      Suporte MatchJob
                    </Text>
                    <Text style={{ color: Colors.textSecondary }} className="text-sm">
                      Resposta em até 24 horas úteis
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => Linking.openURL('mailto:theylonocaradati@gmail.com')}
                  style={{ backgroundColor: Colors.primary }}
                  className="mt-4 rounded-2xl px-5 py-3"
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    Enviar e-mail de suporte
                  </Text>
                </Pressable>
              </View>
            </Card>

            <Card title="Sobre o MatchJob">
              <Text style={{ color: Colors.textSecondary }} className="text-sm">
                O MatchJob conecta clientes a profissionais autônomos de diversas
                categorias. Todo usuário pode contratar e prestar serviços
                simultaneamente.
              </Text>
              <Text style={{ color: Colors.slate400 }} className="mt-2 text-xs">
                Versão 1.0 — App mobile (Expo) + .NET 8
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
