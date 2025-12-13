'use client';

import { cn } from '@/lib/utils';

interface SignupFormProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignupForm({ className, children }: SignupFormProps) {
  return (
    <div className={cn('', className)}>
      {children || <p>SignupForm component</p>}
    </div>
  );
}