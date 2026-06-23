import { SelectHTMLAttributes, forwardRef } from "react";

export const FormSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className = "", children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={`w-full p-2 border border-slate-300 rounded bg-white outline-none transition-all 
                    focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 disabled:bg-slate-50 ${className}`
                }
                {...props}
            >
                {children}
            </select>
        )
    }
)
FormSelect.displayName = "FormSelect"