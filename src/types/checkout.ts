export interface CheckoutData {
  eventId: string;
  ticketSelections: TicketSelection[];
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  billingAddress?: BillingAddress;
  total: number;
  discount?: Discount;
}

export interface TicketSelection {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  features: string[];
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string; // CPF
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PaymentMethod {
  type: 'credit_card' | 'pix' | 'bank_slip';
  creditCard?: {
    number: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    installments: number;
  };
  pix?: {
    key: string;
    type: 'email' | 'phone' | 'document' | 'random';
  };
}

export interface BillingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Discount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

export interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface OrderSummary {
  subtotal: number;
  discount?: number;
  fees: number;
  total: number;
  currency: 'BRL';
}

export interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  fees: {
    percentage: number;
    fixed: number;
  };
}
