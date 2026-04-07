'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FaTicketAlt,
  FaSearch,
  FaUser,
  FaBell,
  FaBars,
  FaTimes,
  FaArrowRight,
} from 'react-icons/fa';

const NAV_LINKS = [
  { href: '/events',    label: 'Eventos' },
  { href: '/organizer', label: 'Para Organizadores' },
  { href: '/help',      label: 'Ajuda' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao mudar de página
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const isHeroPage = pathname === '/';

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

            {/* ---- Logo ---- */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #00C2A8, #007465)' }}
              >
                <FaTicketAlt className="text-white text-sm" />
              </div>
              <span
                className={`text-xl font-black tracking-tight transition-colors ${
                  scrolled || !isHeroPage ? 'text-gray-900' : 'text-white'
                }`}
              >
                Ticketon
              </span>
            </Link>

            {/* ---- Nav Desktop ---- */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    pathname === link.href
                      ? 'text-turquoise'
                      : scrolled || !isHeroPage
                        ? 'text-gray-600 hover:text-turquoise'
                        : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-turquoise rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ---- Actions Desktop ---- */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 ${
                  scrolled || !isHeroPage ? 'text-gray-500 hover:text-turquoise' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaSearch className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <button
                className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-all hover:bg-gray-100 ${
                  scrolled || !isHeroPage ? 'text-gray-500 hover:text-turquoise' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaBell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full border-2 border-white" />
              </button>

              {/* Divisor */}
              <div className={`w-px h-5 mx-1 ${scrolled || !isHeroPage ? 'bg-gray-200' : 'bg-white/20'}`} />

              {/* Entrar */}
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium text-sm px-4 rounded-lg transition-all ${
                    scrolled || !isHeroPage
                      ? 'text-gray-700 hover:text-turquoise hover:bg-turquoise/5'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FaUser className="mr-1.5 text-xs" />
                  Entrar
                </Button>
              </Link>

              {/* Criar Evento - CTA principal */}
              <Link href="/organizer">
                <Button
                  size="sm"
                  className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold px-5 rounded-xl shadow-sm hover:shadow-md hover:shadow-turquoise/20 transition-all text-sm"
                >
                  Criar Evento
                </Button>
              </Link>
            </div>

            {/* ---- Botão Mobile ---- */}
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

        {/* ---- Menu Mobile ---- */}
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
            </div>
          </div>
        </div>
      </header>

      {/* ---- Overlay de busca ---- */}
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
