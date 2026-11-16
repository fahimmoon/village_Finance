import React from 'react'

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-[#1F2937] flex items-center gap-0.5 select-none"
        >
          <span>{label}</span>
          {required && <span className="text-[#B91C1C] font-semibold">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-[11px] font-medium text-[#B91C1C] mt-0.5 leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[#6B7280] mt-0.5 leading-tight">{hint}</p>
      ) : null}
    </div>
  )
}
