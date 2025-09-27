'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'participant' | 'organizer' | 'admin';
}

export default function DashboardLayout({ children, userRole = 'participant' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="flex">
        <Sidebar userRole={userRole} />
        <main className="flex-1 lg:ml-0">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
