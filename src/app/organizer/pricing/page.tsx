import Link from 'next/link';
import { FaCheck, FaTicketAlt, FaChartBar, FaUsers, FaQrcode, FaShieldAlt } from 'react-icons/fa';

const FEATURES_FREE = [
  'Criação ilimitada de eventos',
  'Venda de ingressos gratuitos',
  'Dashboard de check-in',
  'QR code para cada ingresso',
  'Página pública do evento',
  'Lista de participantes',
];

const FEATURES_PAID = [
  'Tudo do plano gratuito',
  'Venda de ingressos pagos',
  'Analytics completo do evento',
  'Dados demográficos do público',
  'Dados de consumo (bar/food)',
  'Pesquisa de satisfação (NPS)',
  'Múltiplos lotes de ingressos',
  'Colaboradores de check-in',
  'Notificações automáticas',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-2">Preços transparentes</h1>
          <p className="text-white/70">Sem mensalidade. Só pagamos juntos quando você vende.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Taxa */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-10">
          <p className="text-sm font-semibold text-[#00C2A8] uppercase tracking-wide mb-2">Como funciona</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl font-black text-gray-900">7%</span>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">por ingresso vendido</p>
              <p className="text-gray-500 text-sm">apenas sobre ingressos pagos</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm">
            A taxa cobre todos os custos de processamento de pagamento e manutenção da plataforma.
            Ingressos gratuitos são sempre <span className="font-bold text-green-600">100% sem custo</span>.
          </p>
          <div className="mt-6 bg-gray-50 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-xs text-gray-500 mb-2">Exemplo de cálculo</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Ingresso R$ 100,00</span><span className="font-medium">R$ 100,00</span></div>
              <div className="flex justify-between text-gray-400"><span>Taxa Ticketon (7%)</span><span>R$ 7,00</span></div>
              <div className="flex justify-between font-bold text-[#00C2A8] border-t border-gray-200 pt-1 mt-1"><span>Total cobrado</span><span>R$ 107,00</span></div>
            </div>
          </div>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Gratuito */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FaTicketAlt className="text-gray-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Eventos Gratuitos</h2>
                <p className="text-2xl font-black text-green-600">R$ 0,00</p>
              </div>
            </div>
            <ul className="space-y-2">
              {FEATURES_FREE.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheck className="text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pago */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#00C2A8] p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C2A8] text-white text-xs font-bold px-4 py-1 rounded-full">
              MAIS POPULAR
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#00C2A818' }}>
                <FaChartBar className="text-[#00C2A8]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Eventos Pagos</h2>
                <p className="text-2xl font-black text-[#00C2A8]">7% por venda</p>
              </div>
            </div>
            <ul className="space-y-2">
              {FEATURES_PAID.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheck className="text-[#00C2A8] shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: FaShieldAlt, label: 'Pagamento seguro', desc: 'SSL + Mercado Pago' },
            { icon: FaQrcode,    label: 'QR Code único',   desc: 'Para cada ingresso' },
            { icon: FaUsers,     label: 'Sem limite',      desc: 'De participantes' },
            { icon: FaChartBar,  label: 'Analytics real',  desc: 'Dados em tempo real' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <item.icon className="text-2xl text-[#00C2A8] mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-2 px-10 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-base"
            style={{ backgroundColor: '#00C2A8' }}
          >
            Criar meu primeiro evento
          </Link>
          <p className="text-gray-400 text-xs mt-3">Gratuito para começar. Sem cartão de crédito.</p>
        </div>
      </div>
    </main>
  );
}
