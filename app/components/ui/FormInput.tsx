import { forwardRef, InputHTMLAttributes } from "react";

export const FormInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`w-full p-2 border border-slate-300 rounded outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
                {...props}
            />
        )
    }
)
FormInput.displayName = "FormInput"