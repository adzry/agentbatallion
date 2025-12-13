'use client';

import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginForm({ className, children }: LoginFormProps) {
  return (
    <div className={cn('', className)}>
      {children || <p>LoginForm component</p>}
    </div>
  );
}