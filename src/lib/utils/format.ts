export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('pt-BR', options || defaultOptions);
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatLongDate = (dateString: string): string => {
  return formatDate(dateString, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

