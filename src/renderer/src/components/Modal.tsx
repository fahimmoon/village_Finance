import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dim flat backdrop */}
      <div className="fixed inset-0 bg-[#0F172A]/40 transition-opacity" onClick={onClose} />

      {/* Modal Dialog with 6px radius and subtle shadow */}
      <div className="flex min-h-full items-center justify-center p-3 text-left">
        <div
          className={`relative transform overflow-hidden rounded-[6px] bg-white border border-[#D9DDE3] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] transition-all w-full my-6 ${maxWidthClasses[maxWidth]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header 15px/600 */}
          <div className="flex items-center justify-between border-b border-[#D9DDE3] px-4 py-3 bg-[#F9FAFB]">
            <h3 className="text-[15px] font-semibold text-[#1F2937] leading-none">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#1F2937] rounded-[3px] p-1 cursor-pointer focus-visible:outline-[#0F766E]"
              aria-label="Close"
              title="Close"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 max-h-[75vh] overflow-y-auto text-[13px] text-[#1F2937]">
            {children}
          </div>

          {/* Footer with right-aligned Cancel & Save buttons */}
          {footer && (
            <div className="border-t border-[#D9DDE3] bg-[#F9FAFB] px-4 py-2.5 flex justify-end items-center gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
