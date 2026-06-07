'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'participant' | 'organizer' | 'admin';
}

export default function DashboardLayout({ children, userRole = 'participant' }: DashboardLayoutProps) {
  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#f8fafc' }}>
      <Sidebar userRole={userRole} />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}
