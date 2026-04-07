export const EVENT_STATUS = {
  ACTIVE: 'active',
  PUBLISHED: 'published',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
} as const;

export const TICKET_STATUS = {
  CONFIRMED: 'confirmed',
  USED: 'used',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  published: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-green-100 text-green-800',
  used: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
} as const;

export const STATUS_LABELS = {
  active: 'Ativo',
  published: 'Ativo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
  draft: 'Rascunho',
  confirmed: 'Confirmado',
  used: 'Utilizado',
  expired: 'Expirado',
} as const;

