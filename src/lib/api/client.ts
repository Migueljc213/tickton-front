import { API_CONFIG } from './config';
import { storage } from '../utils/storage';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: unknown;
  requireAuth?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;

const LOGIN_PATH = '/login';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  getToken(): string | null {
    return storage.getToken();
  }

  setToken(token: string): void {
    storage.setToken(token);
  }

  removeToken(): void {
    storage.removeToken();
  }

  getUserId(): number | null {
    return storage.getUserId();
  }

  setUserId(userId: number): void {
    storage.setUserId(userId);
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (options.requireAuth !== false) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'An error occurred';
    let errorData: unknown;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch {
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      statusText: response.statusText,
    };

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = LOGIN_PATH;
      }
    }

    throw error;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      requireAuth = true,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders({ ...options, headers: customHeaders, requireAuth });

    const config: RequestInit = {
      ...fetchOptions,
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.handleError(response);
      }

      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw { message: 'Request timeout. Please try again.' } as ApiError;
        }
        throw { message: error.message } as ApiError;
      }
      throw error;
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseURL);
export default apiClient;
