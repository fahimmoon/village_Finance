import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
  align?: 'left' | 'center' | 'right'
  totalValue?: string | number
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  searchableFields?: (keyof T)[]
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
  pageSizeOptions?: number[]
  emptyMessage?: string
  emptySubtext?: string
  actions?: React.ReactNode
  toolbarExtra?: React.ReactNode
  onRowClick?: (item: T) => void
  isLoading?: boolean
  showTotals?: boolean
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchableFields,
  defaultSortKey,
  defaultSortOrder = 'asc',
  pageSizeOptions = [15, 30, 50],
  emptyMessage,
  emptySubtext,
  actions,
  toolbarExtra,
  onRowClick,
  isLoading = false,
  showTotals = false
}: DataTableProps<T>): React.JSX.Element {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 15)

  // Filter items
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    const query = searchTerm.toLowerCase().trim()
    return data.filter((item) => {
      if (searchableFields && searchableFields.length > 0) {
        return searchableFields.some((field) => {
          const val = item[field]
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        })
      }
      return Object.values(item).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      )
    })
  }, [data, searchTerm, searchableFields])

  // Sort items
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  }, [filteredData, sortKey, sortOrder])

  // Pagination
  const totalItems = sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string): void => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortKey(undefined)
        setSortOrder('asc')
      }
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const hasTotals = showTotals || columns.some((col) => col.totalValue !== undefined)

  return (
    <div className="w-full bg-white border border-[#D9DDE3] rounded-[6px] flex flex-col text-[13px]">
      {/* Thin toolbar row: search, filters, actions */}
      <div className="h-[44px] px-3 border-b border-[#D9DDE3] bg-white flex items-center justify-between gap-3 toolbar-row">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6B7280]">
              <Search size={14} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('common.search')}
              className="w-full bg-white text-[#1F2937] border border-[#D9DDE3] text-[12px] rounded-[4px] h-[30px] pl-8 pr-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#0F766E]"
            />
          </div>
          {toolbarExtra}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Dense table container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F4F6] border-b border-[#D9DDE3] text-[#374151] text-[12px] font-semibold sticky top-0 z-1">
              {columns.map((col) => {
                const isNumeric = col.align === 'right'
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'

                return (
                  <th
                    key={col.key}
                    className={`py-2 px-3 h-[34px] font-semibold ${alignClass} ${col.className || ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={`inline-flex items-center gap-1 font-semibold text-[#374151] hover:text-[#0F766E] focus-visible:outline-none cursor-pointer ${
                          isNumeric ? 'justify-end w-full' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp size={12} strokeWidth={2} className="text-[#0F766E]" />
                          ) : (
                            <ArrowDown size={12} strokeWidth={2} className="text-[#0F766E]" />
                          )
                        ) : (
                          <ArrowUpDown size={12} strokeWidth={1.5} className="text-[#9CA3AF]" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-[#6B7280]">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center">
                  <div className="max-w-sm mx-auto text-[#6B7280]">
                    <p className="text-[13px] font-medium text-[#1F2937]">
                      {emptyMessage || t('common.noData')}
                    </p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">
                      {emptySubtext || t('common.noDataSubtext')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`h-[34px] hover:bg-[#F9FAFB] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => {
                    const isNumeric = col.align === 'right'
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right tabular-nums'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'

                    return (
                      <td
                        key={col.key}
                        className={`py-1.5 px-3 text-[#1F2937] ${alignClass} ${
                          isNumeric ? 'font-medium' : ''
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(item) : (item[col.key] ?? '—')}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>

          {/* Totals row for money columns in semibold with top border */}
          {hasTotals && !isLoading && paginatedData.length > 0 && (
            <tfoot>
              <tr className="bg-[#F9FAFB] border-t-2 border-[#D9DDE3] font-semibold text-[13px] text-[#1F2937]">
                {columns.map((col, idx) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right tabular-nums'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  return (
                    <td key={col.key} className={`py-2 px-3 ${alignClass}`}>
                      {col.totalValue !== undefined ? col.totalValue : idx === 0 ? 'Total' : ''}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer with row count and pagination on the right */}
      {!isLoading && (
        <div className="h-[38px] px-3 border-t border-[#D9DDE3] bg-[#F9FAFB] flex items-center justify-between text-[12px] text-[#6B7280] select-none">
          <div className="flex items-center gap-3">
            <span>
              {totalItems === 0
                ? '0 records'
                : `${startIndex + 1}–${Math.min(startIndex + pageSize, totalItems)} of ${totalItems} records`}
            </span>
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-white border border-[#D9DDE3] rounded-[3px] h-[24px] px-1 text-[11px] text-[#1F2937]"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-[24px] w-[24px] flex items-center justify-center rounded-[3px] border border-[#D9DDE3] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={14} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-[24px] w-[24px] flex items-center justify-center rounded-[3px] border border-[#D9DDE3] bg-white hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
