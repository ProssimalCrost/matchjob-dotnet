import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export const palette = {
  night: '#17134f',
  nightSoft: '#251d73',
  primary: '#4f46e5',
  primaryStrong: '#6d28d9',
  accent: '#60a5fa',
  surface: '#f8f8ff',
  surfaceStrong: '#ffffff',
  line: '#d8ddf4',
  text: '#1f2456',
  textMuted: '#6e74a6',
  success: '#34c759',
  badge: '#eef2ff',
};

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1100;
  const isTablet = width >= 760 && width < 1100;
  const isCompact = width < 760;

  return {
    width,
    isDesktop,
    isTablet,
    isCompact,
    contentMaxWidth: isDesktop ? 1240 : 1120,
    authMaxWidth: isDesktop ? 1180 : 980,
    cardColumns: isDesktop ? 2 : 1,
  };
}

export function AppBackdrop({ children }) {
  return (
    <View style={styles.backdrop}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />
      <View style={[styles.orb, styles.orbCenter]} />
      {children}
    </View>
  );
}

export function ResponsiveShell({ children, maxWidth, padded = true }) {
  return (
    <View
      style={[
        styles.shell,
        padded && styles.shellPadding,
        maxWidth ? { maxWidth } : null,
      ]}
    >
      {children}
    </View>
  );
}

export function LogoLockup({ centered = false, light = false }) {
  return (
    <View
      style={{
        alignItems: centered ? 'center' : 'flex-start',
      }}
    >
      <View style={styles.logoRow}>
        <BrandMark />
        <Text style={[styles.logoText, light && { color: '#ffffff' }]}>MatchJobs</Text>
      </View>
      <Text
        style={[
          styles.logoSubtext,
          centered && { textAlign: 'center' },
          light && { color: 'rgba(255,255,255,0.75)' },
        ]}
      >
        Conectando talentos as melhores oportunidades
      </Text>
    </View>
  );
}

export function BrandMark({ size = 56 }) {
  return (
    <View
      style={[
        styles.brandMark,
        { width: size, height: size, borderRadius: size * 0.34 },
      ]}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.58, fontWeight: '900' }}>M</Text>
    </View>
  );
}

export function HeroPanel({ title, subtitle, points = [], footer }) {
  return (
    <View style={styles.heroPanel}>
      <LogoLockup light />
      <View style={{ marginTop: 28 }}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </View>

      <View style={{ marginTop: 28, gap: 14 }}>
        {points.map((point) => (
          <View key={point} style={styles.heroPointRow}>
            <View style={styles.heroPointBullet}>
              <Text style={styles.heroPointBulletText}>+</Text>
            </View>
            <Text style={styles.heroPointText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroCardKicker}>Plataforma</Text>
        <Text style={styles.heroCardTitle}>Experiencia inspirada no layout de onboarding e vagas</Text>
        <Text style={styles.heroCardBody}>
          Blocos claros, destaque em azul e roxo, leitura rapida e hierarquia forte para web e celular.
        </Text>
      </View>

      {footer ? <View style={{ marginTop: 18 }}>{footer}</View> : null}
    </View>
  );
}

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <View style={styles.authCard}>
      <Text style={styles.authTitle}>{title}</Text>
      {subtitle ? <Text style={styles.authSubtitle}>{subtitle}</Text> : null}
      <View style={{ marginTop: 22 }}>{children}</View>
      {footer ? <View style={{ marginTop: 18 }}>{footer}</View> : null}
    </View>
  );
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function InputField(props) {
  return (
    <TextInput
      placeholderTextColor="#98a0c9"
      style={[styles.input, props.multiline && styles.textarea]}
      {...props}
    />
  );
}

export function PrimaryButton({ title, onPress, disabled, loading, wide = true }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.primaryButton,
        wide && { alignSelf: 'stretch' },
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      <Text style={styles.primaryButtonText}>{loading ? 'Carregando...' : title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, muted = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.secondaryButton, muted && styles.secondaryMuted]}
    >
      <Text style={[styles.secondaryButtonText, muted && { color: '#ffffff' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Panel({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Tag({ children, tone = 'default' }) {
  const toneStyle =
    tone === 'success'
      ? { backgroundColor: '#eafbf0', color: palette.success }
      : tone === 'dark'
        ? { backgroundColor: 'rgba(255,255,255,0.14)', color: '#ffffff' }
        : { backgroundColor: palette.badge, color: palette.primaryStrong };

  return (
    <View style={[styles.tag, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.tagText, { color: toneStyle.color }]}>{children}</Text>
    </View>
  );
}

export function StatCard({ label, value, compact = false }) {
  return (
    <View style={[styles.statCard, compact && { paddingVertical: 14, paddingHorizontal: 16 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: 34 }}>
      <BrandMark size={48} />
      <Text style={[styles.authTitle, { marginTop: 16, fontSize: 22 }]}>{title}</Text>
      <Text style={[styles.authSubtitle, { textAlign: 'center', maxWidth: 380 }]}>{subtitle}</Text>
    </Panel>
  );
}

export function AuthLayout({
  title,
  subtitle,
  heroTitle,
  heroSubtitle,
  heroPoints,
  children,
  maxWidth,
  compactHeroFooter,
}) {
  const layout = useResponsiveLayout();
  const horizontal = layout.isDesktop;

  return (
    <AppBackdrop>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ResponsiveShell maxWidth={maxWidth || layout.authMaxWidth}>
          <View
            style={{
              flexDirection: horizontal ? 'row' : 'column',
              gap: 24,
              alignItems: 'stretch',
              width: '100%',
            }}
          >
            <View style={{ flex: horizontal ? 1 : undefined }}>
              <HeroPanel
                title={heroTitle}
                subtitle={heroSubtitle}
                points={heroPoints}
                footer={layout.isCompact ? compactHeroFooter : null}
              />
            </View>
            <View style={{ flex: horizontal ? 0.9 : undefined }}>
              <AuthCard title={title} subtitle={subtitle}>
                {children}
              </AuthCard>
            </View>
          </View>
        </ResponsiveShell>
      </ScrollView>
    </AppBackdrop>
  );
}

export function SegmentedOptions({ options, selectedKey, onChange }) {
  return (
    <View style={{ gap: 12 }}>
      {options.map((option) => {
        const active = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.optionCard, active && styles.optionCardActive]}
          >
            <View style={styles.optionMark}>
              <View
                style={[
                  styles.optionMarkInner,
                  active && { backgroundColor: palette.primaryStrong },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, active && { color: palette.primaryStrong }]}>
                {option.title}
              </Text>
              <Text style={styles.optionDescription}>{option.desc}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DesktopHeader({
  eyebrow,
  title,
  subtitle,
  rightAction,
  wide = false,
}) {
  return (
    <View style={[styles.desktopHeader, wide && { minHeight: 230 }]}>
      <View style={styles.headerGlowOne} />
      <View style={styles.headerGlowTwo} />
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={styles.desktopEyebrow}>{eyebrow}</Text>
        <Text style={styles.desktopTitle}>{title}</Text>
        <Text style={styles.desktopSubtitle}>{subtitle}</Text>
      </View>
      {rightAction ? <View style={{ marginTop: 6 }}>{rightAction}</View> : null}
    </View>
  );
}

export function stylesShadow() {
  return Platform.select({
    web: { boxShadow: '0 30px 70px rgba(18, 22, 71, 0.18)' },
    default: {
      shadowColor: '#14174a',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  });
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#4e71e8',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbTop: {
    width: 240,
    height: 240,
    top: -80,
    left: -30,
  },
  orbBottom: {
    width: 340,
    height: 340,
    bottom: -120,
    right: -80,
  },
  orbCenter: {
    width: 200,
    height: 200,
    top: '40%',
    right: '18%',
    backgroundColor: 'rgba(108, 92, 231, 0.14)',
  },
  shell: {
    width: '100%',
    alignSelf: 'center',
  },
  shellPadding: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '900',
  },
  logoSubtext: {
    marginTop: 14,
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 270,
  },
  brandMark: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  heroPanel: {
    flex: 1,
    minHeight: 620,
    borderRadius: 36,
    overflow: 'hidden',
    padding: 28,
    backgroundColor: palette.night,
    ...stylesShadow(),
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    maxWidth: 420,
  },
  heroSubtitle: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 420,
  },
  heroPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroPointBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroPointBulletText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  heroPointText: {
    color: '#e8ebff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  heroCard: {
    marginTop: 'auto',
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroCardKicker: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroCardTitle: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 30,
  },
  heroCardBody: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 24,
  },
  authCard: {
    borderRadius: 36,
    backgroundColor: palette.surfaceStrong,
    padding: 28,
    minHeight: 620,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    ...stylesShadow(),
  },
  authTitle: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  authSubtitle: {
    marginTop: 8,
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fbfbff',
    color: palette.text,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#ffffff',
  },
  secondaryMuted: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.24)',
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...stylesShadow(),
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statCard: {
    flex: 1,
    minWidth: 110,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#edf0ff',
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 8,
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fbfbff',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: '#b9b4ff',
    backgroundColor: '#f4f3ff',
  },
  optionMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#cbd2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionMarkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  optionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  optionDescription: {
    marginTop: 4,
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  desktopHeader: {
    overflow: 'hidden',
    borderRadius: 34,
    backgroundColor: palette.night,
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
    ...stylesShadow(),
  },
  headerGlowOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(125, 142, 255, 0.18)',
    top: -40,
    right: 60,
  },
  headerGlowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 70, 229, 0.24)',
    bottom: -36,
    left: -22,
  },
  desktopEyebrow: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  desktopTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  desktopSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 560,
  },
});
