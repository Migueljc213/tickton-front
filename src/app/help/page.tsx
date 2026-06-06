'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaChevronDown, FaChevronUp, FaWhatsapp, FaEnvelope, FaTicketAlt, FaShieldAlt, FaCalendarAlt, FaCreditCard, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';

/* ── Tipos ── */
interface FAQ {
  q: string;
  a: string;
}
interface Category {
  icon: string;
  title: string;
  desc: string;
  color: string;
  faqs: FAQ[];
}

/* ── Dados ── */
const CATEGORIES: Category[] = [
  {
    icon: '🎫',
    title: 'Ingressos e Compras',
    desc: 'Como comprar, transferir e usar seus ingressos',
    color: 'from-violet-500 to-purple-600',
    faqs: [
      {
        q: 'Como compro um ingresso?',
        a: 'Encontre o evento que deseja, clique em "Ver Detalhes", selecione o tipo de ingresso e a quantidade, depois clique em "Comprar Ingressos". Você será redirecionado para o checkout onde preenche seus dados e escolhe a forma de pagamento (PIX ou cartão de crédito).',
      },
      {
        q: 'Onde ficam meus ingressos após a compra?',
        a: 'Todos os seus ingressos ficam disponíveis na página "Meus Ingressos" (/tickets). Cada ingresso tem um QR Code único que será escaneado na entrada do evento.',
      },
      {
        q: 'Posso comprar ingressos para outra pessoa?',
        a: 'Sim! Durante o checkout você preenche os dados do participante. O ingresso ficará vinculado à sua conta, mas pode ser apresentado por qualquer pessoa com acesso ao QR Code.',
      },
      {
        q: 'Há limite de ingressos por compra?',
        a: 'O limite é definido pelo organizador do evento. Geralmente você pode comprar até 10 ingressos por transação. Verifique a disponibilidade na página do evento.',
      },
      {
        q: 'O que fazer se meu ingresso não aparecer após o pagamento?',
        a: 'Aguarde até 5 minutos. Se ainda não aparecer, verifique sua caixa de e-mail (incluindo spam). Caso o problema persista, entre em contato com nosso suporte via WhatsApp informando o número do pedido.',
      },
    ],
  },
  {
    icon: '💳',
    title: 'Pagamentos',
    desc: 'Formas de pagamento, parcelamento e reembolsos',
    color: 'from-green-500 to-emerald-600',
    faqs: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Aceitamos PIX (aprovação imediata) e cartão de crédito (Visa, Mastercard, Elo, American Express) em até 12x. Não aceitamos boleto bancário ou transferência direta.',
      },
      {
        q: 'Como funciona o pagamento por PIX?',
        a: 'Ao escolher PIX no checkout, será gerado um QR Code e uma chave PIX. Após o pagamento, a aprovação é automática e instantânea. Seu ingresso é liberado em até 1 minuto.',
      },
      {
        q: 'Meu pagamento foi aprovado mas não recebi confirmação. O que fazer?',
        a: 'Verifique sua caixa de e-mail (incluindo spam). Se não encontrar, acesse a página "Meus Ingressos" — se o ingresso estiver lá, a compra foi confirmada. Caso contrário, entre em contato com o suporte.',
      },
      {
        q: 'Como solicitar reembolso?',
        a: 'A política de reembolso é definida pelo organizador do evento. Geralmente é possível solicitar reembolso até 7 dias antes do evento. Entre em contato com o suporte informando o número do pedido.',
      },
      {
        q: 'O pagamento no Ticketon é seguro?',
        a: 'Sim! Utilizamos criptografia SSL em todas as transações. Os dados do cartão são processados por gateways certificados PCI-DSS. Nunca armazenamos dados completos do seu cartão.',
      },
    ],
  },
  {
    icon: '📱',
    title: 'Check-in e QR Code',
    desc: 'Como funciona o acesso ao evento',
    color: 'from-blue-500 to-sky-600',
    faqs: [
      {
        q: 'Como apresentar meu ingresso no evento?',
        a: 'Abra a página "Meus Ingressos" no Ticketon e exiba o QR Code do seu ingresso para o scanner do evento. Certifique-se de que a tela está no brilho máximo.',
      },
      {
        q: 'Preciso imprimir meu ingresso?',
        a: 'Não! O Ticketon é 100% digital. Você só precisa do seu celular com a tela do QR Code visível. Recomendamos salvar o screenshot do QR Code caso fique sem internet.',
      },
      {
        q: 'O que acontece se meu celular acabar a bateria no evento?',
        a: 'Salve um screenshot do QR Code antes de ir ao evento. Você pode apresentar a imagem salva para o scanner. Alternativamente, anote o código de confirmação do pedido.',
      },
      {
        q: 'Posso usar o mesmo QR Code mais de uma vez?',
        a: 'Não. Cada QR Code é de uso único e é invalidado após o primeiro scan. Qualquer tentativa de reutilização será bloqueada pelo sistema.',
      },
      {
        q: 'Posso transferir meu ingresso para outra pessoa?',
        a: 'A funcionalidade de transferência está em desenvolvimento. Por enquanto, a pessoa pode apresentar seu telefone com o QR Code ou um screenshot.',
      },
    ],
  },
  {
    icon: '🎪',
    title: 'Para Organizadores',
    desc: 'Criar e gerenciar seus eventos na plataforma',
    color: 'from-orange-500 to-amber-600',
    faqs: [
      {
        q: 'Como criar um evento?',
        a: 'Acesse "Para Organizadores" e faça login com uma conta de organizador. No dashboard, clique em "Novo Evento" e preencha as informações: título, descrição, data, local, categoria e ingressos disponíveis.',
      },
      {
        q: 'Quanto custa usar o Ticketon para eventos gratuitos?',
        a: 'Eventos gratuitos não têm nenhuma taxa! A plataforma é 100% gratuita para eventos sem cobrança de ingresso.',
      },
      {
        q: 'Qual a taxa para eventos pagos?',
        a: 'Para eventos pagos, aplicamos uma taxa de 5% sobre o valor de cada ingresso vendido + R$ 1,00 por transação. O repasse para o organizador é feito em D+2 após o evento.',
      },
      {
        q: 'Posso editar meu evento após publicá-lo?',
        a: 'Sim! Você pode editar título, descrição, banner e informações gerais a qualquer momento. Alterações em datas e preços ficam restritas para eventos com ingressos já vendidos.',
      },
      {
        q: 'Como funciona o check-in de participantes?',
        a: 'Use o app gratuito de check-in ou acesse o painel do organizador. Você pode escanear os QR Codes dos participantes com a câmera do celular ou buscar pelo nome.',
      },
      {
        q: 'Como faço para exportar a lista de participantes?',
        a: 'No dashboard do evento, acesse a aba "Participantes" e clique em "Exportar CSV". O arquivo conterá nome, e-mail, tipo de ingresso e status de check-in de todos os participantes.',
      },
    ],
  },
  {
    icon: '🔐',
    title: 'Conta e Segurança',
    desc: 'Gerenciar seu perfil e configurações',
    color: 'from-teal-500 to-cyan-600',
    faqs: [
      {
        q: 'Esqueci minha senha. Como recuperar?',
        a: 'Na tela de login, clique em "Esqueceu a senha?" e informe seu e-mail. Você receberá um link para criar uma nova senha. O link expira em 1 hora.',
      },
      {
        q: 'Como alterar meu e-mail ou senha?',
        a: 'Acesse as configurações da sua conta no menu do perfil. Você pode alterar e-mail e senha a qualquer momento. Por segurança, a alteração de e-mail requer confirmação no e-mail atual.',
      },
      {
        q: 'Como excluir minha conta?',
        a: 'Para excluir sua conta, entre em contato com nosso suporte via e-mail com o assunto "Excluir conta". O processo leva até 30 dias e é irreversível.',
      },
      {
        q: 'Meus dados estão seguros no Ticketon?',
        a: 'Sim! Seguimos a LGPD (Lei Geral de Proteção de Dados). Seus dados são criptografados e nunca compartilhados com terceiros sem seu consentimento. Leia nossa Política de Privacidade para mais detalhes.',
      },
    ],
  },
];

const ALL_FAQS = CATEGORIES.flatMap((cat) =>
  cat.faqs.map((faq) => ({ ...faq, category: cat.title }))
);

/* ── Componente FAQ Item ── */
function FaqItem({ faq, defaultOpen = false }: { faq: FAQ & { category?: string }; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'border-turquoise shadow-sm shadow-turquoise/10' : 'border-gray-100'}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
        {open
          ? <FaChevronUp className="text-turquoise shrink-0 text-xs" />
          : <FaChevronDown className="text-gray-400 shrink-0 text-xs" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white">
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Página principal ── */
export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = ALL_FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  const showSearch = search.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-dark-blue to-[#005166] py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-turquoise/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-turquoise/30">
            <FaQuestionCircle className="text-turquoise text-2xl" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Central de Ajuda</h1>
          <p className="text-white/65 text-lg mb-8 max-w-xl mx-auto">
            Encontre respostas rápidas para as dúvidas mais frequentes
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por dúvidas, temas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-4 rounded-2xl border-0 bg-white shadow-xl text-gray-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-turquoise/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-medium"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* ── Resultados da busca ── */}
        {showSearch ? (
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-5">
              {filteredFaqs.length} resultado{filteredFaqs.length !== 1 ? 's' : ''} para <strong className="text-gray-900">"{search}"</strong>
            </p>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🤷</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500 text-sm mb-6">Tente palavras-chave diferentes ou entre em contato com o suporte.</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-turquoise font-semibold text-sm hover:underline"
                >
                  Ver todas as perguntas
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => (
                  <div key={i}>
                    {faq.category && (
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-1">{faq.category}</p>
                    )}
                    <FaqItem faq={faq} defaultOpen />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Categorias ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
                  className={`text-left p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md group ${
                    activeCategory === cat.title
                      ? 'border-turquoise bg-turquoise/5 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-turquoise/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                    {cat.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 transition-colors ${activeCategory === cat.title ? 'text-turquoise' : 'text-gray-900 group-hover:text-turquoise'}`}>
                    {cat.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="text-[11px] text-gray-400">{cat.faqs.length} perguntas</span>
                    <FaArrowRight className={`text-[10px] transition-all ${activeCategory === cat.title ? 'text-turquoise translate-x-0.5' : 'text-gray-300 group-hover:text-turquoise group-hover:translate-x-0.5'}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* ── FAQs da categoria selecionada ── */}
            {activeCategory ? (
              <div className="max-w-3xl mx-auto mb-16">
                {CATEGORIES.filter((c) => c.title === activeCategory).map((cat) => (
                  <div key={cat.title}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl`}>
                        {cat.icon}
                      </div>
                      <h2 className="text-xl font-black text-gray-900">{cat.title}</h2>
                    </div>
                    <div className="space-y-3">
                      {cat.faqs.map((faq, i) => (
                        <FaqItem key={i} faq={faq} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Perguntas mais frequentes (default) ── */
              <div className="max-w-3xl mx-auto mb-16">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-turquoise rounded-full" />
                  Perguntas mais frequentes
                </h2>
                <div className="space-y-3">
                  {ALL_FAQS.slice(0, 8).map((faq, i) => (
                    <FaqItem key={i} faq={faq} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Contato com suporte ── */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-dark-blue to-[#005166] rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-black text-white mb-2">Não encontrou sua resposta?</h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
              Nossa equipe está disponível de segunda a sexta, das 9h às 18h, para te ajudar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
              >
                <FaWhatsapp className="text-xl" />
                <div className="text-left">
                  <p className="text-xs opacity-75 leading-none">Falar via</p>
                  <p className="text-sm leading-tight">WhatsApp</p>
                </div>
              </a>
              <a
                href="mailto:suporte@ticketon.com.br"
                className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                <FaEnvelope className="text-xl" />
                <div className="text-left">
                  <p className="text-xs opacity-75 leading-none">Enviar</p>
                  <p className="text-sm leading-tight">E-mail</p>
                </div>
              </a>
            </div>
            <p className="text-white/40 text-xs mt-6">
              suporte@ticketon.com.br · (11) 99999-9999
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
