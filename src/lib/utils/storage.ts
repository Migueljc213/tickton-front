const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_ROLE: 'userRole',
} as const;

const isBrowser = () => typeof window !== 'undefined';

export const storage = {
  get: (key: string): string | null => {
    if (!isBrowser()) return null;
    return localStorage.getItem(key);
  },

  set: (key: string, value: string): void => {
    if (!isBrowser()) return;
    localStorage.setItem(key, value);
  },

  remove: (key: string): void => {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
  },

  getToken: (): string | null => storage.get(STORAGE_KEYS.ACCESS_TOKEN),
  
  setToken: (token: string): void => storage.set(STORAGE_KEYS.ACCESS_TOKEN, token),
  
  removeToken: (): void => storage.remove(STORAGE_KEYS.ACCESS_TOKEN),

  getUserId: (): number | null => {
    const userId = storage.get(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  },

  setUserId: (userId: number): void => storage.set(STORAGE_KEYS.USER_ID, userId.toString()),
  removeUserId: (): void => storage.remove(STORAGE_KEYS.USER_ID),

  getUserEmail: (): string | null => storage.get(STORAGE_KEYS.USER_EMAIL),
  setUserEmail: (email: string): void => storage.set(STORAGE_KEYS.USER_EMAIL, email),
  removeUserEmail: (): void => storage.remove(STORAGE_KEYS.USER_EMAIL),

  getUserName: (): string | null => storage.get(STORAGE_KEYS.USER_NAME),
  setUserName: (name: string): void => storage.set(STORAGE_KEYS.USER_NAME, name),
  removeUserName: (): void => storage.remove(STORAGE_KEYS.USER_NAME),

  getUserRole: (): string | null => storage.get(STORAGE_KEYS.USER_ROLE),
  setUserRole: (role: string): void => storage.set(STORAGE_KEYS.USER_ROLE, role),
  removeUserRole: (): void => storage.remove(STORAGE_KEYS.USER_ROLE),
};

