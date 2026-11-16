import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F6F8] text-[#1F2937]">
      {/* 220px Fixed Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* 48px Top Bar */}
        <TopBar />

        {/* Full width content with max 24px padding */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F6F8]">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
