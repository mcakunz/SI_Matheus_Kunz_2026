import { forwardRef, InputHTMLAttributes } from "react"

interface FormSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
    textoAtivo?: string
    textoInativo?: string
}

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
    ({ className = "", textoAtivo = "Ativo", textoInativo = "Inativo", ...props }, ref) => {
        return (
            <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
                <input 
                    type="checkbox" 
                    ref={ref} 
                    className="sr-only peer" 
                    {...props} 
                />
                
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                
                <span className="ml-3 text-sm font-medium text-slate-600 peer-checked:hidden">
                    {textoInativo}
                </span>
                <span className="ml-3 text-sm font-medium text-emerald-600 hidden peer-checked:block">
                    {textoAtivo}
                </span>
            </label>
        )
    }
)

FormSwitch.displayName = "FormSwitch"