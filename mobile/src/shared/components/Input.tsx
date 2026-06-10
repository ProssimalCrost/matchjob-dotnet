import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  isPassword,
  containerClassName,
  className,
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="text-slate-300 text-sm font-medium mb-1.5">{label}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center bg-slate-800 border rounded-xl px-3.5',
          error ? 'border-red-500' : 'border-slate-700',
        )}
      >
        <TextInput
          className={cn('flex-1 h-[50px] text-[15px] text-slate-50', className)}
          placeholderTextColor="#64748b"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="p-1">
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="mt-1 text-xs text-red-400">{error}</Text>}
    </View>
  );
}
