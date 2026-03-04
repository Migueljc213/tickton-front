import Link from 'next/link';
import { FaRocket, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaRocket className="text-2xl text-turquoise" />
              <span className="text-2xl font-bold">Ticketon</span>
            </div>
            <p className="text-light-green/90 text-sm">
              A plataforma completa para criar, gerenciar e participar de eventos incríveis.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-light-green/60 hover:text-turquoise transition-colors">
                <FaFacebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-light-green/60 hover:text-turquoise transition-colors">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-light-green/60 hover:text-turquoise transition-colors">
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-light-green/60 hover:text-turquoise transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-light-green/60 hover:text-turquoise transition-colors">
                <FaYoutube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Para Participantes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Para Participantes</h3>
            <nav className="space-y-2">
              <Link href="/events" className="block text-light-green/90 hover:text-white transition-colors">
                Descobrir Eventos
              </Link>
              <Link href="/events/categories" className="block text-light-green/90 hover:text-white transition-colors">
                Categorias
              </Link>
              <Link href="/tickets" className="block text-light-green/90 hover:text-white transition-colors">
                Meus Ingressos
              </Link>
              <Link href="/help" className="block text-light-green/90 hover:text-white transition-colors">
                Central de Ajuda
              </Link>
              <Link href="/help/refund" className="block text-light-green/90 hover:text-white transition-colors">
                Política de Reembolso
              </Link>
            </nav>
          </div>

          {/* Para Organizadores */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Para Organizadores</h3>
            <nav className="space-y-2">
              <Link href="/organizer" className="block text-light-green/90 hover:text-white transition-colors">
                Criar Evento
              </Link>
              <Link href="/organizer/dashboard" className="block text-light-green/90 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/organizer/pricing" className="block text-light-green/90 hover:text-white transition-colors">
                Preços
              </Link>
              <Link href="/organizer/features" className="block text-light-green/90 hover:text-white transition-colors">
                Funcionalidades
              </Link>
              <Link href="/organizer/support" className="block text-light-green/90 hover:text-white transition-colors">
                Suporte Técnico
              </Link>
            </nav>
          </div>

          {/* Suporte */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Suporte</h3>
            <div className="space-y-2">
              <p className="text-light-green/90 text-sm">
                <strong>WhatsApp:</strong><br />
                (11) 99999-9999
              </p>
              <p className="text-light-green/90 text-sm">
                <strong>E-mail:</strong><br />
                suporte@ticketon.com.br
              </p>
              <p className="text-light-green/90 text-sm">
                <strong>Horário:</strong><br />
                Seg - Sex: 9h às 18h
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-medium-gray mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-6 text-sm text-light-green/90">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Política de Cookies
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                Segurança
              </Link>
            </div>
            <p className="text-sm text-light-green/80">
              © 2025 Ticketon. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
