'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaCalendarAlt,
  FaTicketAlt,
  FaUsers,
  FaChartBar,
  FaCog,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaComments,
} from 'react-icons/fa';

interface SidebarProps {
  userRole?: 'participant' | 'organizer' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = {
  organizer: [
    { label: 'Dashboard',    href: '/organizer/dashboard', icon: FaHome },
    { label: 'Eventos',      href: '/organizer/events',    icon: FaCalendarAlt },
    { label: 'Ingressos',    href: '/tickets',             icon: FaTicketAlt },
    { label: 'Comunidade',   href: '/organizer/community', icon: FaComments },
    { label: 'Configurações',href: '/organizer/settings',  icon: FaCog },
  ],
  participant: [
    { label: 'Dashboard',    href: '/dashboard',           icon: FaHome },
    { label: 'Eventos',      href: '/events',              icon: FaCalendarAlt },
    { label: 'Meus Ingressos',href: '/tickets',            icon: FaTicketAlt },
    { label: 'Configurações',href: '/settings',            icon: FaCog },
  ],
  admin: [
    { label: 'Dashboard',    href: '/admin/dashboard',     icon: FaChartBar },
    { label: 'Usuários',     href: '/admin/users',         icon: FaUsers },
    { label: 'Eventos',      href: '/admin/events',        icon: FaCalendarAlt },
    { label: 'Configurações',href: '/admin/settings',      icon: FaCog },
  ],
};

export default function Sidebar({ userRole = 'participant', isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[userRole] ?? NAV_ITEMS.participant;

  const isActive = (href: string) =>
    href.endsWith('/dashboard') ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-[#003B4A] text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Ticket icon SVG inline for crispness */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C2A8]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4Z"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Ticketon</span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-5 mb-2 flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 border border-white/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00C2A8] text-sm font-bold text-white">
            JS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">João Silva</p>
            <p className="truncate text-xs text-[#A7F0E0]/70 capitalize">{userRole}</p>
          </div>
          <button className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#A7F0E0]/60 hover:bg-white/10 hover:text-[#A7F0E0] transition-colors relative">
            <FaBell className="h-3.5 w-3.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-[#FF7043]" />
          </button>
        </div>

        {/* Nav label */}
        <p className="px-6 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Menu
        </p>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                      ${active
                        ? 'bg-[#00C2A8] text-white shadow-md shadow-[#00C2A8]/20'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="shrink-0 border-t border-white/10 p-3 space-y-0.5">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white transition-all duration-150">
            <FaSignOutAlt className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
