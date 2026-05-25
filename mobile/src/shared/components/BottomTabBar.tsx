import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const TABS: Tab[] = [
  { label: 'Início', icon: 'home-outline', activeIcon: 'home', href: '/home' },
  { label: 'Profissionais', icon: 'search-outline', activeIcon: 'search', href: '/professionals' },
  { label: 'Mensagens', icon: 'chatbubble-outline', activeIcon: 'chatbubble', href: '/messages' },
  { label: 'Pedidos', icon: 'briefcase-outline', activeIcon: 'briefcase', href: '/requests' },
  { label: 'Perfil', icon: 'person-outline', activeIcon: 'person', href: '/profile' },
];

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <TouchableOpacity
            key={tab.href}
            style={styles.tab}
            onPress={() => router.push(tab.href as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.primary,
  },
});
