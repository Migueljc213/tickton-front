'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars, FaBell, FaChevronDown } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'participant' | 'organizer' | 'admin';
  pageTitle?: string;
}

export default function DashboardLayout({
  children,
  userRole = 'participant',
  pageTitle,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7F8]">
      {/* Sidebar */}
      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6 lg:px-8 shadow-sm z-30">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
            >
              <FaBars className="h-4 w-4" />
            </button>

            {/* Ticketon logo — visible on mobile only (sidebar is hidden) */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00C2A8]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4Z"/>
                </svg>
              </div>
              <span className="text-base font-bold text-[#003B4A]">Ticketon</span>
            </div>

            {pageTitle && (
              <h1 className="hidden text-base font-semibold text-[#212529] lg:block">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right: notifications + profile */}
          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <FaBell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF7043] ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00C2A8] text-xs font-bold text-white shrink-0">
                JS
              </div>
              <span className="hidden text-sm font-medium text-[#212529] sm:block">João Silva</span>
              <FaChevronDown className="hidden h-3 w-3 text-gray-400 sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
