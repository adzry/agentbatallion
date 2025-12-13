import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
}

export function Card({ className, children, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-surface',
    elevated: 'bg-surface shadow-lg',
    outline: 'bg-transparent border border-border',
    glass: 'glass',
  };

  return (
    <div className={cn('rounded-xl p-6', variants[variant], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-xl font-semibold', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-text-secondary', className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mt-4 pt-4 border-t border-border', className)}>{children}</div>;
}