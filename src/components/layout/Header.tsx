'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/utils/storage';
import { authService } from '@/lib/api/services/auth.service';
import {
  FaTicketAlt,
  FaSearch,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChartLine,
  FaShieldAlt,
} from 'react-icons/fa';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { usersService } from '@/lib/api/services/users.service';

const NAV_LINKS = [
  { href: '/events',      label: 'Eventos' },
  { href: '/organizers',  label: 'Organizadores' },
  { href: '/organizer',   label: 'Para Organizadores' },
  { href: '/help',        label: 'Ajuda' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [scrolled, setScrolled]         = useState(false);
  const [userName, setUserName]         = useState<string | null>(null);
  const [userRole, setUserRole]         = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, [pathname]);

  // Lê auth do localStorage; se nome ausente busca da API
  useEffect(() => {
    const token = storage.getToken();
    setIsLoggedIn(!!token);
    setUserRole(storage.getUserRole());

    const storedName = storage.getUserName();
    if (storedName) {
      setUserName(storedName);
    } else if (token) {
      usersService.getMe().then((user) => {
        storage.setUserName(user.name);
        storage.setUserRole(user.role);
        setUserName(user.name);
        setUserRole(user.role);
      }).catch(() => {});
    } else {
      setUserName(null);
    }
  }, [pathname]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : '/events');
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUserName(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const isHeroPage = pathname === '/';

  const navTextClass = (active: boolean) => {
    if (active) return 'text-turquoise';
    return scrolled || !isHeroPage
      ? 'text-gray-600 hover:text-turquoise'
      : 'text-white hover:text-white/80';
  };

  const iconClass = scrolled || !isHeroPage
    ? 'text-gray-500 hover:text-turquoise'
    : 'text-white hover:text-white/80 hover:bg-white/10';

  const initials = userName
    ? userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled || !isHeroPage
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #00C2A8, #007465)' }}
              >
                <FaTicketAlt className="text-white text-sm" />
              </div>
              <span className={`text-xl font-black tracking-tight transition-colors ${
                scrolled || !isHeroPage ? 'text-gray-900' : 'text-white'
              }`}>
                Ticketon
              </span>
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${navTextClass(pathname === link.href)}`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-turquoise rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {/* Busca */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 ${iconClass}`}
              >
                <FaSearch className="w-4 h-4" />
              </button>

              {/* Notificações */}
              <NotificationDropdown lightBg={scrolled || !isHeroPage} />

              <div className={`w-px h-5 mx-1 ${scrolled || !isHeroPage ? 'bg-gray-200' : 'bg-white/20'}`} />

              {isLoggedIn ? (
                <>
                {/* Botão CTA por role */}
                {userRole === 'participant' && (
                  <Link href="/tickets">
                    <Button size="sm" className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold px-4 rounded-xl text-sm">
                      <FaTicketAlt className="mr-1.5 text-xs" />
                      Meus Ingressos
                    </Button>
                  </Link>
                )}
                {userRole === 'organizer' && (
                  <Link href="/organizer/dashboard">
                    <Button size="sm" className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold px-4 rounded-xl text-sm">
                      <FaChartLine className="mr-1.5 text-xs" />
                      Meu Dashboard
                    </Button>
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button size="sm" className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold px-4 rounded-xl text-sm">
                      <FaShieldAlt className="mr-1.5 text-xs" />
                      Admin
                    </Button>
                  </Link>
                )}
                {/* Dropdown do usuário logado */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                      scrolled || !isHeroPage
                        ? 'hover:bg-gray-100'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-turquoise flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                    <span className={`text-sm font-medium max-w-[120px] truncate ${
                      scrolled || !isHeroPage ? 'text-gray-700' : 'text-white'
                    }`}>
                      {userName?.split(' ')[0]}
                    </span>
                    <FaChevronDown className={`w-3 h-3 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    } ${scrolled || !isHeroPage ? 'text-gray-500' : 'text-white/80'}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-turquoise transition-colors"
                      >
                        <FaCog className="w-4 h-4" />
                        Configurações
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`font-medium text-sm px-4 rounded-lg transition-all ${
                        scrolled || !isHeroPage
                          ? 'text-gray-700 hover:text-turquoise hover:bg-turquoise/5'
                          : 'text-white hover:text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <FaUser className="mr-1.5 text-xs" />
                      Entrar
                    </Button>
                  </Link>

                  <Link href="/organizer">
                    <Button
                      size="sm"
                      className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold px-5 rounded-xl shadow-sm hover:shadow-md hover:shadow-turquoise/20 transition-all text-sm"
                    >
                      Criar Evento
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Botão Mobile */}
            <button
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                scrolled || !isHeroPage
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-turquoise/8 text-turquoise'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-turquoise'
                }`}
              >
                {link.label}
                <FaArrowRight className="text-xs opacity-40" />
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-turquoise flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                    <span className="font-medium text-gray-800">{userName}</span>
                  </div>
                  <Link href="/settings">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl font-medium">
                      <FaCog className="mr-2 text-xs" />
                      Configurações
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium border-0"
                    variant="outline"
                  >
                    <FaSignOutAlt className="mr-2 text-xs" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:border-turquoise hover:text-turquoise rounded-xl font-medium">
                      <FaUser className="mr-2 text-xs" />
                      Entrar na conta
                    </Button>
                  </Link>
                  <Link href="/organizer">
                    <Button className="w-full bg-turquoise hover:bg-turquoise-600 text-white rounded-xl font-semibold">
                      Criar Evento
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay de busca */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-24 px-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up">
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-lg font-bold text-gray-900">Buscar eventos</h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar eventos, artistas, locais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/15 outline-none text-gray-900 placeholder-gray-400 text-sm"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Pressione <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">Esc</kbd> para fechar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
