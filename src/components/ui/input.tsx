import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="text-xs font-black uppercase tracking-widest text-ash ml-1">{label}</label>}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-ash group-focus-within:text-forest transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-6 text-sm font-bold text-charcoal placeholder:text-ash/50",
              "focus:outline-none focus:border-forest/20 focus:bg-white focus:ring-4 focus:ring-forest/5 transition-all shadow-sm",
              "disabled:bg-stone/20 disabled:text-ash",
              error && "border-error/20 focus:border-error/30 focus:ring-error/10 bg-error/5",
              leftIcon && "pl-14",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-bold text-error ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, leftIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="text-xs font-black uppercase tracking-widest text-ash ml-1">{label}</label>}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-ash group-focus-within:text-forest transition-colors pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              "w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-6 text-sm font-bold text-charcoal appearance-none",
              "focus:outline-none focus:border-forest/20 focus:bg-white focus:ring-4 focus:ring-forest/5 transition-all shadow-sm",
              error && "border-error/20 bg-error/5",
              leftIcon && "pl-14",
              className
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ash">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        {error && <p className="text-xs font-bold text-error ml-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="text-xs font-black uppercase tracking-widest text-ash ml-1">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-charcoal placeholder:text-ash/50 min-h-[120px]",
            "focus:outline-none focus:border-forest/20 focus:bg-white focus:ring-4 focus:ring-forest/5 transition-all shadow-sm resize-none",
            error && "border-error/20 bg-error/5",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-bold text-error ml-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
