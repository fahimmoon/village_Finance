import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ message, title, type = 'info', duration = 3500 }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: Toast = { id, message, title, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: 'success' }),
    [addToast]
  )
  const error = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: 'error' }),
    [addToast]
  )
  const warning = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: 'warning' }),
    [addToast]
  )
  const info = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: 'info' }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none text-[13px]">
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              border: 'border-[#BBF7D0]',
              bg: 'bg-[#F0FDF4]',
              text: 'text-[#15803D]',
              icon: (
                <CheckCircle2
                  size={16}
                  strokeWidth={1.75}
                  className="text-[#15803D] shrink-0 mt-0.5"
                />
              )
            },
            error: {
              border: 'border-[#FECACA]',
              bg: 'bg-[#FEF2F2]',
              text: 'text-[#B91C1C]',
              icon: (
                <AlertCircle
                  size={16}
                  strokeWidth={1.75}
                  className="text-[#B91C1C] shrink-0 mt-0.5"
                />
              )
            },
            warning: {
              border: 'border-[#FDE68A]',
              bg: 'bg-[#FFFBEB]',
              text: 'text-[#B45309]',
              icon: (
                <AlertTriangle
                  size={16}
                  strokeWidth={1.75}
                  className="text-[#B45309] shrink-0 mt-0.5"
                />
              )
            },
            info: {
              border: 'border-[#BFDBFE]',
              bg: 'bg-[#EFF6FF]',
              text: 'text-[#1D4ED8]',
              icon: <Info size={16} strokeWidth={1.75} className="text-[#1D4ED8] shrink-0 mt-0.5" />
            }
          }[t.type]

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-[4px] border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)] bg-white ${typeConfig.border}`}
            >
              {typeConfig.icon}
              <div className="flex-1">
                {t.title && (
                  <h4 className="font-semibold text-[13px] text-[#1F2937] leading-tight mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-[12px] text-[#4B5563] leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-[#9CA3AF] hover:text-[#4B5563] p-0.5 cursor-pointer"
                aria-label="Dismiss"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
