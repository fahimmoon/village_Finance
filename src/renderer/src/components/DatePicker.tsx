import React, { forwardRef } from 'react'
import { Calendar } from 'lucide-react'

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className = '', error = false, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6B7280]">
          <Calendar size={16} strokeWidth={1.75} />
        </div>
        <input
          ref={ref}
          type="date"
          disabled={disabled}
          className={`w-full bg-white text-[#1F2937] border text-[13px] rounded-[4px] h-[32px] pl-8 pr-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed cursor-pointer ${
            error
              ? 'border-[#B91C1C] focus-visible:outline-[#B91C1C]'
              : 'border-[#D9DDE3] hover:border-[#9CA3AF] focus:border-[#0F766E]'
          } ${className}`}
          {...props}
        />
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
