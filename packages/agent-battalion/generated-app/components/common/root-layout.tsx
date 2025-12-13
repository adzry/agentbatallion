'use client';

import { cn } from '@/lib/utils';

interface RootLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

export function RootLayout({ className, children }: RootLayoutProps) {
  return (
    <div className={cn('', className)}>
      {children || <p>RootLayout component</p>}
    </div>
  );
}