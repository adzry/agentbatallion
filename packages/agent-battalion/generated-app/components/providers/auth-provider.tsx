'use client';

import { cn } from '@/lib/utils';

interface AuthProviderProps {
  className?: string;
  children?: React.ReactNode;
}

export function AuthProvider({ className, children }: AuthProviderProps) {
  return (
    <div className={cn('', className)}>
      {children || <p>AuthProvider component</p>}
    </div>
  );
}