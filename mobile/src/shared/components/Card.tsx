import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '../utils/cn';

interface Props extends ViewProps {
  className?: string;
}

export function Card({ className, children, ...props }: Props) {
  return (
    <View
      className={cn(
        'bg-slate-900 rounded-2xl p-4 border border-slate-800',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}
