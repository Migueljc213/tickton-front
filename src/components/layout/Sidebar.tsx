'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/utils/storage';
import { authService } from '@/lib/api/services/auth.service';
import { usersService } from '@/lib/api/services/users.service';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaQrcode,
  FaCog,
  FaTimes,
  FaBars,
  FaSignOutAlt,
  FaPlus,
  FaShieldAlt,
  FaUserTie,
  FaHome,
  FaChartBar,
} from 'react-icons/fa';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  participant: [
    { label: 'Explorar Eventos',   href: '/events',            icon: <FaCalendarAlt /> },
    { label: 'Meus Ingressos',     href: '/tickets',           icon: <FaTicketAlt /> },
    { label: 'Minha Equipe',       href: '/staff',             icon: <FaShieldAlt /> },
    { label: 'Virar Organizador',  href: '/become-organizer',  icon: <FaUserTie /> },
    { label: 'Configurações',      href: '/settings',          icon: <FaCog /> },
  ],
  organizer: [
    { label: 'Dashboard',       href: '/organizer/dashboard',    icon: <FaChartLine /> },
    { label: 'Criar Evento',    href: '/organizer/events/new',   icon: <FaPlus /> },
    { label: 'Participantes',   href: '/organizer/participants', icon: <FaUsers /> },
    { label: 'Check-in',        href: '/organizer/checkin',      icon: <FaQrcode /> },
    { label: 'Analytics',       href: '/organizer/analytics',   icon: <FaChartBar /> },
    { label: 'Perfil',          href: '/organizer/profile',      icon: <FaUserTie /> },
    { label: 'Configurações',   href: '/settings',               icon: <FaCog /> },
  ],
  admin: [
    { label: 'Dashboard',          href: '/admin/dashboard', icon: <FaHome /> },
    { label: 'Usuários',           href: '/admin/users',     icon: <FaUsers /> },
    { label: 'Eventos',            href: '/admin/events',    icon: <FaCalendarAlt /> },
    { label: 'Configurações',      href: '/settings',        icon: <FaCog /> },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  organizer: 'Organizador',
  participant: 'Participante',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin:       <FaShieldAlt className="text-purple-500" />,
  organizer:   <FaUserTie className="text-blue-500" />,
  participant: <FaTicketAlt className="text-turquoise" />,
};

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole: roleProp }: SidebarProps) {
  const [isOpen, setIsOpen]         = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);
  const [role, setRole]             = useState<string>(roleProp ?? 'participant');
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const stored = storage.getUserName();
    const storedRole = storage.getUserRole();
    if (storedRole) setRole(storedRole);
    if (stored) {
      setUserName(stored);
    } else if (storage.getToken()) {
      usersService.getMe().then(u => {
        storage.setUserName(u.name);
        storage.setUserRole(u.role);
        setUserName(u.name);
        setRole(u.role);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.participant;

  const isActive = (href: string) => {
    if (href === '/events') return pathname === href || pathname.startsWith('/events/');
    return pathname === href || pathname.startsWith(href + '/');
  };

  const initials = userName
    ? userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Botão mobile de abrir */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex flex-col bg-white border-r border-gray-100 shadow-sm
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo + fechar mobile */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-ticketon.png"
              alt="Ticketon"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-700">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Info do usuário */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-turquoise flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{userName ?? 'Usuário'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                {ROLE_ICON[role]}
                <span>{ROLE_LABEL[role] ?? 'Participante'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-turquoise/10 text-turquoise'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={`text-base flex-shrink-0 ${active ? 'text-turquoise' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-turquoise" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm rounded-xl"
          >
            <FaSignOutAlt className="w-4 h-4 mr-3" />
            Sair da conta
          </Button>
        </div>
      </aside>
    </>
  );
}
