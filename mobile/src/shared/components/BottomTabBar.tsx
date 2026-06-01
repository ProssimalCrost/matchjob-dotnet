import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const TABS: Tab[] = [
  { label: 'Início', icon: 'home-outline', activeIcon: 'home', href: '/home' },
  { label: 'Buscar', icon: 'search-outline', activeIcon: 'search', href: '/professionals' },
  { label: 'Mensagens', icon: 'chatbubble-outline', activeIcon: 'chatbubble', href: '/messages' },
  { label: 'Pedidos', icon: 'briefcase-outline', activeIcon: 'briefcase', href: '/requests' },
  { label: 'Perfil', icon: 'person-outline', activeIcon: 'person', href: '/profile' },
];

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-slate-900 border-t border-slate-800 pt-2"
      style={{ paddingBottom: insets.bottom || 8 }}
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <TouchableOpacity
            key={tab.href}
            className="flex-1 items-center gap-0.5"
            onPress={() => router.push(tab.href as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? '#7c3aed' : '#64748b'}
            />
            <Text
              className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
