export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isFieldEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

export const validateRequired = (fields: Record<string, unknown>): string[] => {
  const errors: string[] = [];
  Object.entries(fields).forEach(([key, value]) => {
    if (isFieldEmpty(value as string)) {
      errors.push(key);
    }
  });
  return errors;
};

