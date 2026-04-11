import { LabelHTMLAttributes } from "react";
import { RequiredSymbol } from "./RequiredSymbol";

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean,
}

export const FormLabel = ({
    children,
    required,
    className = "",
    ...props
}: FormLabelProps) => {
    return (
        <label 
            className={`block text-sm font-medium mb-1 text-slate-700 ${className}`} 
            {...props}
        >
            {children} {required && <RequiredSymbol />}
        </label>
    );
};