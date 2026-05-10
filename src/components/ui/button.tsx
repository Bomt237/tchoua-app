"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:pointer-events-none active:scale-95 hover:scale-[1.02]";

    const variants = {
      default: "bg-forest text-white hover:bg-forest-dark focus:ring-forest/20 shadow-lg shadow-forest/10",
      secondary: "bg-gold text-charcoal hover:bg-gold-light focus:ring-gold/20 shadow-lg shadow-gold/10",
      outline: "bg-white/50 border-2 border-stone text-graphite hover:border-forest/30 hover:bg-white focus:ring-forest/10",
      ghost: "text-graphite hover:bg-forest/5 hover:text-forest",
      destructive: "bg-error text-white hover:bg-error/90 focus:ring-error/20 shadow-lg shadow-error/10",
      success: "bg-success text-white hover:bg-success/90 focus:ring-success/20 shadow-lg shadow-success/10",
      indigo: "bg-indigo text-white hover:opacity-90 focus:ring-indigo/20 shadow-lg shadow-indigo/10",
      terracotta: "bg-terracotta text-white hover:bg-terracotta-light focus:ring-terracotta/20 shadow-lg shadow-terracotta/10",
    };

    const sizes = {
      sm: "h-9 px-4",
      md: "h-12 px-6",
      lg: "h-14 px-8 text-xs",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant as keyof typeof variants] || variants.default, sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <RefreshCw className="animate-spin w-4 h-4" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
