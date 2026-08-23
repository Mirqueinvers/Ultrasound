import type { AuthAPI } from "../../../electron/preload";

/**
 * Адаптер над window.authAPI.
 * Компоненты и хуки работают только через этот сервис.
 */
export const authService = {
  register: (data: Parameters<AuthAPI["register"]>[0]) =>
    window.authAPI.register(data),
  login: (data: { username: string; password: string }) =>
    window.authAPI.login(data),
  getUser: (userId: string) => window.authAPI.getUser(userId),
  updateUser: (data: {
    id: string;
    name: string;
    username: string;
    organization?: string;
  }) => window.authAPI.updateUser(data),
  changePassword: (data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) => window.authAPI.changePassword(data),
  isAvailable: () => !!window.authAPI,
} satisfies AuthAPI & { isAvailable: () => boolean };
