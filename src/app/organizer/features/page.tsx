import Link from 'next/link';
import {
  FaTicketAlt, FaQrcode, FaChartBar, FaUsers, FaBell, FaCog,
  FaShieldAlt, FaMobileAlt, FaCalendarAlt, FaCommentAlt,
} from 'react-icons/fa';

const FEATURES = [
  {
    icon: FaTicketAlt,
    title: 'Venda de Ingressos',
    desc: 'Crie múltiplos lotes com preços, datas e quantidades diferentes. Suporte a ingressos gratuitos e pagos.',
    color: '#00C2A8',
  },
  {
    icon: FaQrcode,
    title: 'Check-in por QR Code',
    desc: 'Cada ingresso recebe um QR code único. Valide entradas em tempo real pela plataforma ou app mobile.',
    color: '#003B4A',
  },
  {
    icon: FaChartBar,
    title: 'Analytics Completo',
    desc: 'Acompanhe vendas diárias, horários de pico, taxa de check-in, no-show e receita em tempo real.',
    color: '#7c3aed',
  },
  {
    icon: FaUsers,
    title: 'Dados Demográficos',
    desc: 'Conheça seu público: faixa etária, gênero e localização dos compradores de ingressos.',
    color: '#2563eb',
  },
  {
    icon: FaCommentAlt,
    title: 'Pesquisa de Satisfação',
    desc: 'Colete NPS, avaliações de estrutura (som, banheiro, bar, segurança) e comentários abertos.',
    color: '#d97706',
  },
  {
    icon: FaBell,
    title: 'Notificações Automáticas',
    desc: 'Seus participantes recebem alertas de eventos próximos e confirmação de check-in.',
    color: '#dc2626',
  },
  {
    icon: FaShieldAlt,
    title: 'Pagamento Seguro',
    desc: 'Integração com Mercado Pago. Transações protegidas com criptografia SSL.',
    color: '#16a34a',
  },
  {
    icon: FaMobileAlt,
    title: 'Portaria Mobile',
    desc: 'Leia QR codes diretamente pelo celular. Adicione colaboradores para ajudar no check-in.',
    color: '#0891b2',
  },
  {
    icon: FaCalendarAlt,
    title: 'Gestão Completa',
    desc: 'Edite eventos, gerencie lotes, poste atualizações e acompanhe participantes em um só lugar.',
    color: '#db2777',
  },
  {
    icon: FaCog,
    title: 'Dados de Consumo',
    desc: 'Registre vendas de bar e alimentação para análise de consumo por categoria e horário.',
    color: '#ea580c',
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-3xl font-bold mb-2">Tudo que você precisa para o seu evento</h1>
          <p className="text-white/70">Ferramentas profissionais para organizadores de todos os tamanhos</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18` }}
              >
                <f.icon className="text-xl" style={{ color: f.color }} />
              </div>
              <h2 className="font-bold text-gray-900 mb-1">{f.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pronto para começar?</h2>
          <p className="text-gray-500 text-sm mb-6">Crie seu evento gratuitamente em minutos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/organizer/events/new"
              className="px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00C2A8' }}
            >
              Criar evento agora
            </Link>
            <Link
              href="/organizer/pricing"
              className="px-8 py-3 font-semibold rounded-xl border-2 border-[#00C2A8] text-[#00C2A8] hover:bg-[#00C2A8]/5 transition-colors"
            >
              Ver preços
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
