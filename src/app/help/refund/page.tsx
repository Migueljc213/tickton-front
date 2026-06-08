import Link from 'next/link';
import { FaShieldAlt, FaEnvelope, FaClock } from 'react-icons/fa';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-2">Política de Reembolso</h1>
          <p className="text-white/70 text-sm">Atualizada em 01 de janeiro de 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FaShieldAlt, color: '#16a34a', label: 'Compra protegida', desc: 'Seus direitos são garantidos' },
            { icon: FaClock,     color: '#d97706', label: 'Prazo de 7 dias',  desc: 'Para solicitar reembolso' },
            { icon: FaEnvelope,  color: '#00C2A8', label: 'Simples e rápido', desc: 'Reembolso em até 5 dias úteis' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}18` }}>
                <item.icon style={{ color: item.color }} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: '1. Direito de Arrependimento',
            text: 'De acordo com o Código de Defesa do Consumidor (Art. 49), o comprador tem até 7 (sete) dias corridos após a compra para solicitar o cancelamento e reembolso integral, sem necessidade de justificativa, desde que o evento ainda não tenha ocorrido.',
          },
          {
            title: '2. Cancelamento do Evento pelo Organizador',
            text: 'Se o organizador cancelar o evento, todos os compradores serão automaticamente reembolsados em até 5 dias úteis no método de pagamento original. A Ticketon notificará todos os participantes por e-mail.',
          },
          {
            title: '3. Reembolso Parcial',
            text: 'Solicitações realizadas após 7 dias da compra, mas antes de 48h do início do evento, ficam a critério do organizador. O organizador define em sua política se aceita reembolsos fora do prazo legal.',
          },
          {
            title: '4. Ingressos Não Reembolsáveis',
            text: 'Após o início do evento ou após o acesso ter sido validado (check-in realizado), o ingresso não poderá ser reembolsado, exceto em casos de cancelamento ou reagendamento por parte do organizador.',
          },
          {
            title: '5. Como Solicitar',
            text: 'Para solicitar reembolso dentro do prazo legal, entre em contato com nosso suporte pelo e-mail suporte@ticketon.com.br informando: nome completo, e-mail da compra, ID do pedido e motivo da solicitação.',
          },
          {
            title: '6. Prazo de Devolução',
            text: 'Reembolsos aprovados são processados em até 5 dias úteis. O crédito no cartão pode levar até 2 faturas dependendo da operadora. Pagamentos via PIX são devolvidos em até 1 dia útil.',
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4">
          <FaEnvelope className="text-3xl text-[#00C2A8] shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900">Precisa solicitar um reembolso?</p>
            <p className="text-sm text-gray-500">Entre em contato: <span className="text-[#00C2A8] font-medium">suporte@ticketon.com.br</span></p>
          </div>
          <Link href="/help" className="px-6 py-2.5 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shrink-0" style={{ backgroundColor: '#00C2A8' }}>
            Central de Ajuda
          </Link>
        </div>
      </div>
    </main>
  );
}
