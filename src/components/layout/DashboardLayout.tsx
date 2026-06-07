'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'participant' | 'organizer' | 'admin';
}

export default function DashboardLayout({ children, userRole = 'participant' }: DashboardLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      <Sidebar userRole={userRole} />
      <main style={{ flex: 1, background: '#f8fafc', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
