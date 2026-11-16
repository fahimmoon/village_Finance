import React, { useState, useEffect } from 'react'
import { formatMoney, rupeesToPaisa, paisaToRupeesString } from '../utils/formatters'

export interface MoneyInputProps {
  valuePaisa: number | null | undefined
  onChangePaisa: (paisa: number) => void
  disabled?: boolean
  error?: boolean
  placeholder?: string
  id?: string
  name?: string
  className?: string
  autoFocus?: boolean
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  valuePaisa,
  onChangePaisa,
  disabled = false,
  error = false,
  placeholder = '0.00',
  id,
  name,
  className = '',
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState<string>(() =>
    valuePaisa !== null && valuePaisa !== undefined && valuePaisa !== 0
      ? paisaToRupeesString(valuePaisa)
      : ''
  )

  useEffect(() => {
    const currentPaisa = rupeesToPaisa(inputValue)
    if (valuePaisa !== undefined && valuePaisa !== null && valuePaisa !== currentPaisa) {
      setInputValue(valuePaisa === 0 ? '' : paisaToRupeesString(valuePaisa))
    }
  }, [valuePaisa])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const text = e.target.value
    if (/^\d*\.?\d{0,2}$/.test(text)) {
      setInputValue(text)
      const calculatedPaisa = rupeesToPaisa(text)
      onChangePaisa(calculatedPaisa)
    }
  }

  const currentComputedPaisa = rupeesToPaisa(inputValue)

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none select-none text-[12px] font-semibold text-[#6B7280]">
          Rs
        </div>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          className={`w-full bg-white text-[#1F2937] border text-[13px] font-medium tabular-nums rounded-[4px] h-[32px] pl-8 pr-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E] disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed ${
            error
              ? 'border-[#B91C1C] focus-visible:outline-[#B91C1C]'
              : 'border-[#D9DDE3] hover:border-[#9CA3AF] focus:border-[#0F766E]'
          } ${className}`}
        />
      </div>
      {inputValue && (
        <div className="mt-1 text-[11px] text-[#6B7280] flex justify-between tabular-nums">
          <span>Amount:</span>
          <span className="font-semibold text-[#0F766E]">{formatMoney(currentComputedPaisa)}</span>
        </div>
      )}
    </div>
  )
}
