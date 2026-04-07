'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaRocket, FaSearch, FaUser, FaBell, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FaRocket className="text-2xl text-turquoise" />
            <span className="text-2xl font-bold text-dark-gray">Ticketon</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className="text-dark-gray hover:text-turquoise transition-colors font-medium text-[#1A202C] hover:text-[#00C2A8]"
            >
              Eventos
            </Link>
            <Link 
              href="/organizer" 
              className="text-dark-gray hover:text-turquoise transition-colors font-medium text-[#1A202C] hover:text-[#00C2A8]"
            >
              Para Organizadores
            </Link>
            <Link 
              href="/help" 
              className="text-dark-gray hover:text-turquoise transition-colors font-medium text-[#1A202C] hover:text-[#00C2A8]"
            >
              Ajuda
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1A202C] hover:text-[#00C2A8] bg-transparent"
            >
              <FaSearch className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#1A202C] hover:text-[#00C2A8] bg-transparent relative"
            >
              <FaBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#1A202C] hover:text-[#00C2A8] bg-transparent"
              >
                <FaUser className="w-5 h-5" />
              </Button>
              <div className="hidden lg:block">
                <Button variant="outline" size="sm" className="border-[#00C2A8] text-[#1A202C] hover:bg-[#00C2A8] hover:text-white">
                  Entrar
                </Button>
              </div>
            </div>

            {/* CTA Button */}
            <Button className="bg-[#00C2A8] hover:bg-[#009B86] text-white">
              Criar Evento
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#1A202C] bg-transparent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/events" 
                className="text-[#1A202C] hover:text-[#00C2A8] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link 
                href="/organizer" 
                className="text-[#1A202C] hover:text-[#00C2A8] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Para Organizadores
              </Link>
              <Link 
                href="/help" 
                className="text-[#1A202C] hover:text-[#00C2A8] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Ajuda
              </Link>
              
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" className="w-full border-[#00C2A8] text-[#1A202C] hover:bg-[#00C2A8] hover:text-white">
                  Entrar
                </Button>
                <Button className="w-full bg-[#00C2A8] hover:bg-[#009B86] text-white">
                  Criar Evento
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  placeholder="Buscar eventos, artistas, locais..."
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray placeholder-medium-gray"
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsSearchOpen(false)}
              >
                <FaTimes />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
