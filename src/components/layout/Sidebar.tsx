'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaTicketAlt, 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaRocket,
  FaSignOutAlt,
  FaBell
} from 'react-icons/fa';

interface SidebarProps {
  userRole?: 'participant' | 'organizer' | 'admin';
}

export default function Sidebar({ userRole = 'participant' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const getNavigationItems = () => {
    const baseItems = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: FaHome,
        roles: ['participant', 'organizer', 'admin']
      },
      {
        label: 'Eventos',
        href: '/events',
        icon: FaCalendarAlt,
        roles: ['participant', 'organizer', 'admin']
      },
      {
        label: 'Meus Ingressos',
        href: '/tickets',
        icon: FaTicketAlt,
        roles: ['participant']
      }
    ];

    const organizerItems = [
      {
        label: 'Meus Eventos',
        href: '/organizer/events',
        icon: FaCalendarAlt,
        roles: ['organizer']
      },
      {
        label: 'Dashboard',
        href: '/organizer/dashboard',
        icon: FaChartLine,
        roles: ['organizer']
      },
      {
        label: 'Participantes',
        href: '/organizer/participants',
        icon: FaUsers,
        roles: ['organizer']
      }
    ];

    const adminItems = [
      {
        label: 'Painel Admin',
        href: '/admin/dashboard',
        icon: FaChartLine,
        roles: ['admin']
      },
      {
        label: 'Gerenciar Usuários',
        href: '/admin/users',
        icon: FaUsers,
        roles: ['admin']
      },
      {
        label: 'Gerenciar Eventos',
        href: '/admin/events',
        icon: FaCalendarAlt,
        roles: ['admin']
      }
    ];

    return [...baseItems, ...organizerItems, ...adminItems].filter(item => 
      item.roles.includes(userRole)
    );
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/organizer/dashboard' || href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <div className="flex items-center space-x-2">
            <FaRocket className="text-2xl text-turquoise" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-dark-gray">Galliard</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-light-gray">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">JS</span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-semibold text-dark-gray">João Silva</p>
                <p className="text-sm text-medium-gray capitalize">{userRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${active 
                        ? 'bg-turquoise/10 text-turquoise border-r-2 border-turquoise' 
                        : 'text-medium-gray hover:bg-light-gray/50 hover:text-dark-gray'
                      }
                    `}
                    onClick={() => setIsCollapsed(true)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-light-gray space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-medium-gray hover:text-dark-gray hover:bg-light-gray/50"
          >
            <FaBell className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Notificações</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-medium-gray hover:text-dark-gray hover:bg-light-gray/50"
          >
            <FaCog className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Configurações</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-medium-gray hover:text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-white shadow-md"
      >
        <FaBars className="w-5 h-5" />
      </Button>
    </>
  );
}
