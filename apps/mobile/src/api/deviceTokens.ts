import { del, post } from './client';

export const registerDeviceToken = (platform: 'IOS' | 'ANDROID', pushToken: string) =>
  post<{ id: string }>('/device-tokens', { platform, pushToken });
export const unregisterDeviceToken = (id: string) => del<void>(`/device-tokens/${id}`);
