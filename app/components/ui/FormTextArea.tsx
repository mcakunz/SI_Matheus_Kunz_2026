import { forwardRef, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type FormTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
                    "placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                    "resize-y min-h-[80px]",
                    className
                )}
                {...props}
            />
        )
    }
)

FormTextArea.displayName = "FormTextArea"