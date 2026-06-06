'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome,
  FaEnvelope,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface PurchasedTicket {
  id: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  ticketId: number;
  createdAt: string;
}

interface OrderData {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ ticketId: number; quantity: number; unitPrice: number }>;
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    paid: { label: 'Pago', className: 'bg-green-100 text-green-700' },
    pending_payment: { label: 'Aguardando pagamento', className: 'bg-yellow-100 text-yellow-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
    expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-600' },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const orderId = searchParams.get('order') ?? searchParams.get('orderId');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Pedido não identificado');
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [orderRes, ticketsRes] = await Promise.all([
          fetch(`${API_URL}/orders/${orderId}`, { headers }),
          fetch(`${API_URL}/purchased-tickets/my`, { headers }),
        ]);

        if (!orderRes.ok) throw new Error('Pedido não encontrado');

        const orderData = await orderRes.json();
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];

        setOrder(orderData.order ?? orderData);
        // filtra apenas os ingressos deste pedido
        setTickets(
          (ticketsData as PurchasedTicket[]).filter((t) => t.id && orderId
            ? true // se API retornar todos, filtrar por orderId abaixo
            : false
          ).filter((t: any) => String(t.orderId) === String(orderId)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [orderId, getToken, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Carregando seu pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md space-y-4">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">
            {error ?? 'Pedido não encontrado'}
          </h2>
          <p className="text-gray-500 text-sm">
            Seu pagamento pode estar sendo processado. Verifique seus ingressos em alguns instantes.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/tickets')}
              className="px-5 py-2.5 text-white rounded-lg font-medium text-sm"
              style={{ backgroundColor: '#00C2A8' }}
            >
              Ver Meus Ingressos
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-sm text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
            >
              Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isPending = order.status === 'pending_payment';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Hero */}
        <div className="text-center mb-10">
          {isPaid ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaClock className="text-yellow-500 text-4xl" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaExclamationTriangle className="text-red-500 text-4xl" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isPaid
              ? 'Compra confirmada!'
              : isPending
              ? 'Aguardando confirmação de pagamento'
              : 'Pagamento não concluído'}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            {isPaid
              ? 'Seus ingressos estão prontos. Apresente o QR code na entrada do evento.'
              : isPending
              ? 'Assim que o pagamento for confirmado pelo Mercado Pago, seus ingressos serão gerados automaticamente.'
              : 'Se acredita que houve um erro, entre em contato com o suporte.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: order + tickets */}
          <div className="lg:col-span-2 space-y-5">

            {/* Order summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FaTicketAlt className="text-[#00C2A8]" />
                Pedido #{order.id}
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span className="font-medium text-gray-800">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-bold text-gray-800">Total pago</span>
                <span className="font-bold text-lg" style={{ color: '#00C2A8' }}>
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>
            </div>

            {/* QR Codes */}
            {isPaid && tickets.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-4">
                  Seus Ingressos ({tickets.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tickets.map((t, idx) => (
                    <div
                      key={t.id}
                      className="border border-gray-100 rounded-xl p-5 text-center space-y-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Ingresso {idx + 1}
                      </p>
                      <div className="flex justify-center">
                        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <QRCodeSVG
                            value={t.qrCode}
                            size={140}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-mono break-all">{t.qrCode}</p>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          t.status === 'valid'
                            ? 'bg-green-100 text-green-700'
                            : t.status === 'used'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {t.status === 'valid' ? 'Válido' : t.status === 'used' ? 'Utilizado' : 'Cancelado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isPaid && tickets.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
                Seus ingressos estão sendo gerados. Verifique em{' '}
                <button
                  onClick={() => router.push('/tickets')}
                  className="underline font-medium"
                >
                  Meus Ingressos
                </button>{' '}
                em instantes.
              </div>
            )}

            {/* Next steps */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">Próximos passos</h2>
              <ol className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Confirmação por e-mail',
                    desc: 'Você receberá os detalhes do pedido por e-mail.',
                  },
                  {
                    step: 2,
                    title: 'Salve seus QR codes',
                    desc: 'Tire um print ou salve seus ingressos no app.',
                  },
                  {
                    step: 3,
                    title: 'Chegue com antecedência',
                    desc: 'Apresente o QR code na entrada. Chegue 30 min antes.',
                  },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: '#00C2A8' }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/tickets')}
              className="w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00C2A8' }}
            >
              <FaTicketAlt />
              Ver Meus Ingressos
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
            >
              <FaHome />
              Início
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3 mt-4">
              <p className="font-semibold text-gray-800">Precisa de ajuda?</p>
              <a
                href="mailto:suporte@ticketon.com.br"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#00C2A8]"
              >
                <FaEnvelope /> suporte@ticketon.com.br
              </a>
              <a
                href="/help"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#00C2A8]"
              >
                <FaCalendarAlt /> Central de Ajuda
              </a>
            </div>

            {isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1">Pagamento pendente</p>
                <p>Se você já pagou via PIX ou boleto, aguarde alguns minutos para a confirmação automática.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
