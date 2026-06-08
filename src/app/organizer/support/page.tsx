import Link from 'next/link';
import { FaWhatsapp, FaEnvelope, FaBook, FaQuestionCircle, FaCommentDots } from 'react-icons/fa';

const FAQS = [
  {
    q: 'Como adicionar colaboradores para o check-in?',
    a: 'Acesse seu evento → aba "Colaboradores" → insira o e-mail do colaborador. Ele receberá acesso para validar ingressos pelo QR code.',
  },
  {
    q: 'O participante pode transferir o ingresso para outra pessoa?',
    a: 'No momento a transferência deve ser solicitada pelo suporte. Em breve lançaremos a transferência self-service.',
  },
  {
    q: 'Quando recebo o repasse das vendas?',
    a: 'Após o encerramento do evento, o repasse é processado em até 2 dias úteis para a conta cadastrada no Mercado Pago.',
  },
  {
    q: 'Como cancelar um evento e reembolsar os compradores?',
    a: 'Entre em contato pelo suporte informando o ID do evento. Processamos os reembolsos automaticamente via Mercado Pago.',
  },
  {
    q: 'Posso editar o evento após publicar?',
    a: 'Sim. Você pode editar título, descrição, local e banner a qualquer momento. Alterações em lotes só podem ser feitas antes das vendas.',
  },
];

export default function OrganizerSupportPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-2">Suporte para Organizadores</h1>
          <p className="text-white/70">Estamos aqui para ajudar você a ter o melhor evento</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12 space-y-8">
        {/* Canais de contato */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: FaWhatsapp,
              color: '#16a34a',
              title: 'WhatsApp',
              desc: '(11) 99999-9999',
              sub: 'Seg–Sex 9h às 18h',
              href: 'https://wa.me/5511999999999',
            },
            {
              icon: FaEnvelope,
              color: '#00C2A8',
              title: 'E-mail',
              desc: 'suporte@ticketon.com.br',
              sub: 'Resposta em até 24h',
              href: 'mailto:suporte@ticketon.com.br',
            },
            {
              icon: FaBook,
              color: '#7c3aed',
              title: 'Central de Ajuda',
              desc: 'Artigos e tutoriais',
              sub: 'Disponível 24/7',
              href: '/help',
            },
          ].map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${c.color}18` }}
              >
                <c.icon className="text-2xl" style={{ color: c.color }} />
              </div>
              <p className="font-bold text-gray-900">{c.title}</p>
              <p className="text-sm text-[#00C2A8] font-medium mt-1">{c.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </a>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <FaQuestionCircle className="text-[#00C2A8]" /> Perguntas Frequentes
          </h2>
          <div className="space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <p className="font-semibold text-gray-800 mb-1">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA para help */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-5">
          <FaCommentDots className="text-4xl text-[#00C2A8] shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900">Não encontrou sua resposta?</p>
            <p className="text-sm text-gray-500 mt-0.5">Acesse a Central de Ajuda completa com tutoriais passo a passo.</p>
          </div>
          <Link
            href="/help"
            className="px-6 py-2.5 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shrink-0"
            style={{ backgroundColor: '#00C2A8' }}
          >
            Central de Ajuda
          </Link>
        </div>
      </div>
    </main>
  );
}
