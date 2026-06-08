import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { supabase } from '@/src/core/supabase/client';
import { removeToken } from '@/src/shared/utils/token';
import { Colors } from '@/src/shared/constants/colors';

type NavItem = {
  href?: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Same destinations as the front Sidebar.
const NAV_ITEMS: NavItem[] = [
  { href: '/professionals', label: 'Dashboard', icon: 'grid-outline' },
  { href: '/services', label: 'Serviços', icon: 'bag-outline' },
  { href: '/chat', label: 'Mensagens', icon: 'chatbubbles-outline' },
  { href: '/favorites', label: 'Favoritos', icon: 'heart-outline' },
  { href: '/profile/edit', label: 'Perfil', icon: 'person-circle-outline' },
  { href: '/settings', label: 'Configurações', icon: 'settings-outline' },
];

function isActive(pathname: string, path: string) {
  if (path === '/professionals') return pathname === '/professionals';
  return pathname.startsWith(path);
}

function DrawerContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    await removeToken();
    onNavigate();
    router.replace('/login');
  }

  return (
    <View
      style={{ backgroundColor: Colors.slate950 }}
      className="flex-1 px-4 pt-2"
    >
      {/* Brand */}
      <Pressable
        onPress={() => {
          onNavigate();
          router.push('/professionals');
        }}
        className="mb-8 flex-row items-center gap-3 px-2"
      >
        <View
          style={{ backgroundColor: Colors.white }}
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
        >
          <Image
            source={require('@/assets/logos/logoside.png')}
            style={{ height: 44, width: 44 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text className="text-xl font-bold tracking-tight text-white">
            MatchJob
          </Text>
          <Text style={{ color: Colors.slate400 }} className="text-xs">
            Painel profissional
          </Text>
        </View>
      </Pressable>

      {/* Nav */}
      <ScrollView className="flex-1">
        <View className="gap-2">
          {NAV_ITEMS.map((item) => {
            const active = item.href ? isActive(pathname, item.href) : false;
            return (
              <Pressable
                key={item.href}
                onPress={() => {
                  onNavigate();
                  if (item.href) router.push(item.href as never);
                }}
                style={{
                  backgroundColor: active ? Colors.primary : 'transparent',
                }}
                className="w-full flex-row items-center gap-3 rounded-xl px-4 py-3"
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={active ? Colors.white : Colors.slate400}
                />
                <Text
                  style={{ color: active ? Colors.white : Colors.slate300 }}
                  className="flex-1 text-sm font-medium"
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Logout */}
      <View
        style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}
        className="border-t pt-4"
      >
        <Pressable
          onPress={handleLogout}
          className="w-full flex-row items-center gap-3 rounded-xl px-4 py-3"
        >
          <Ionicons name="power-outline" size={20} color={Colors.slate400} />
          <Text style={{ color: Colors.slate300 }} className="text-sm font-medium">
            Sair
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Header bar with a hamburger that opens the slide-in drawer.
 * Replaces the front's persistent left sidebar with a native drawer pattern,
 * keeping the same navigation items and visual identity.
 */
export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <SafeAreaView style={{ backgroundColor: Colors.slate950 }}>
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable
            onPress={() => setOpen(true)}
            hitSlop={10}
            className="rounded-xl p-1"
          >
            <Ionicons name="menu" size={26} color={Colors.white} />
          </Pressable>
          <Image
            source={require('@/assets/logos/logoside.png')}
            style={{ height: 28, width: 28 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-white">MatchJob</Text>
        </View>
      </SafeAreaView>

      {/* Drawer */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 flex-row">
          <View style={{ width: 288 }}>
            <SafeAreaView
              style={{ backgroundColor: Colors.slate950 }}
              className="flex-1"
            >
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
                style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}
                className="rounded-xl p-2"
              >
                <Ionicons name="close" size={22} color={Colors.white} />
              </Pressable>
              <DrawerContent onNavigate={() => setOpen(false)} />
            </SafeAreaView>
          </View>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ flex: 1, backgroundColor: Colors.overlay }}
          />
        </View>
      </Modal>
    </>
  );
}
