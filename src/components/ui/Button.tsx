import React from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger';
export type ButtonSize = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ember text-on-ember hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface-2 text-ink border border-line hover:bg-surface-3 active:bg-surface',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2 active:bg-surface-3',
  icon: 'text-ink-2 hover:text-ink hover:bg-surface-2 active:bg-surface-3 rounded-full p-2',
  danger: 'bg-danger-wash text-danger hover:bg-danger hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm font-medium rounded-control',
  lg: 'h-12 px-5 text-base font-semibold rounded-control',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'press inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        variant !== 'icon' && sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
