'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// Prefixos de rotas que usam DashboardLayout (sem header/footer global).
// Usar '/organizer/' (com barra) para NÃO afetar a landing page /organizer.
const DASHBOARD_PREFIXES = [
  '/organizer/',
  '/admin',
  '/staff',
  '/settings',
  '/dashboard',
  '/checkin',
];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
