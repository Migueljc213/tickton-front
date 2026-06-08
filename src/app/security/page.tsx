import { FaShieldAlt, FaLock, FaCreditCard, FaUserShield, FaBug, FaEnvelope } from 'react-icons/fa';

const MEASURES = [
  {
    icon: FaLock,
    color: '#00C2A8',
    title: 'Criptografia SSL/TLS',
    desc: 'Toda comunicação entre seu navegador e nossos servidores é criptografada com SSL/TLS, garantindo que seus dados nunca sejam interceptados.',
  },
  {
    icon: FaCreditCard,
    color: '#003B4A',
    title: 'Pagamentos via Mercado Pago',
    desc: 'Não armazenamos dados de cartão de crédito. Todo o processamento é feito pelo Mercado Pago, certificado PCI DSS nível 1.',
  },
  {
    icon: FaUserShield,
    color: '#7c3aed',
    title: 'Autenticação segura',
    desc: 'Senhas armazenadas com hash bcrypt. Tokens JWT com expiração automática. Proteção contra ataques de força bruta.',
  },
  {
    icon: FaShieldAlt,
    color: '#16a34a',
    title: 'Proteção de dados (LGPD)',
    desc: 'Seguimos a Lei Geral de Proteção de Dados. Você pode solicitar a exclusão dos seus dados a qualquer momento.',
  },
  {
    icon: FaBug,
    color: '#d97706',
    title: 'QR Codes únicos',
    desc: 'Cada ingresso possui um QR code UUID único, gerado de forma segura. Impossível de duplicar ou falsificar dentro da plataforma.',
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-2">Segurança</h1>
          <p className="text-white/70">Como protegemos você e suas informações</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {MEASURES.map((m) => (
            <div key={m.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${m.color}18` }}
              >
                <m.icon className="text-xl" style={{ color: m.color }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">{m.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaEnvelope className="text-[#00C2A8]" /> Reportar uma vulnerabilidade
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Se você encontrar uma vulnerabilidade de segurança na plataforma, por favor, nos contate
            responsavelmente pelo e-mail{' '}
            <a href="mailto:seguranca@ticketon.com.br" className="text-[#00C2A8] font-medium hover:underline">
              seguranca@ticketon.com.br
            </a>
            {' '}antes de divulgar publicamente. Investigaremos e responderemos em até 72h.
          </p>
        </div>
      </div>
    </main>
  );
}
