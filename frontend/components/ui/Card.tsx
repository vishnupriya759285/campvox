import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function Card({ children, className = '', hoverEffect = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white/95 rounded-3xl border border-[#D8E8E9] shadow-card p-6 sm:p-7 transition-all duration-200 ${
        hoverEffect ? 'hover:-translate-y-0.5 hover:shadow-hover hover:border-emerald-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
