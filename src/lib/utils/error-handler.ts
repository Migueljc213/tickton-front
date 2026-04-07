export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};

export const createAsyncErrorHandler = (defaultMessage: string) => {
  return (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return defaultMessage;
  };
};

