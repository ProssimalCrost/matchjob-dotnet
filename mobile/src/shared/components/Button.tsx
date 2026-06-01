import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { cn } from '../utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

const VARIANTS: Record<Variant, { btn: string; text: string; spinner: string }> = {
  primary: {
    btn: 'bg-primary',
    text: 'text-white',
    spinner: 'white',
  },
  secondary: {
    btn: 'bg-teal-400',
    text: 'text-slate-900',
    spinner: '#0f172a',
  },
  outline: {
    btn: 'border border-primary bg-transparent',
    text: 'text-primary',
    spinner: '#7c3aed',
  },
  ghost: {
    btn: 'bg-transparent',
    text: 'text-primary',
    spinner: '#7c3aed',
  },
  danger: {
    btn: 'bg-red-600',
    text: 'text-white',
    spinner: 'white',
  },
};

export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  className,
  ...props
}: Props) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={cn(
        'rounded-xl py-3.5 px-5 items-center justify-center min-h-[50px]',
        v.btn,
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} size="small" />
      ) : (
        <Text className={cn('text-[15px] font-semibold tracking-wide', v.text)}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
