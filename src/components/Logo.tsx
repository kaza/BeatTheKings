import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  pulsing?: boolean;
  className?: string;
}

export function Logo({ size = 'md', pulsing = true, className }: LogoProps) {
  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold shadow-lg',
        sizes[size],
        pulsing && 'animate-pulse',
        className
      )}
    >
      <span>👑</span>
    </div>
  );
}