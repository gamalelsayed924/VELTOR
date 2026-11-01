import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2.5 font-medium transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A365] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantStyles = {
    primary:
      'bg-[#C6A365] text-[#0B0B0E] hover:bg-[#D6B578] active:translate-y-[1px] font-semibold',
    secondary:
      'bg-transparent border border-[#F4F1EA]/25 text-[#F4F1EA] hover:border-[#C6A365] hover:text-[#C6A365] active:translate-y-[1px]',
    ghost:
      'bg-transparent text-[#9E9A90] hover:text-[#F4F1EA] hover:bg-white/[0.04]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-6 py-3 text-sm min-h-[44px]',
    lg: 'px-8 py-3.5 text-sm md:text-base min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
