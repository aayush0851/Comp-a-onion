import { post, get } from './client';
import type { ApiUser } from './types';

export type LoginResponse = { accessToken: string; user: ApiUser };

export const loginWithGoogle = (accessToken: string) => post<LoginResponse>('/auth/google', { accessToken });
export const loginWithApple = (identityToken: string) => post<LoginResponse>('/auth/apple', { identityToken });
export const me = () => get<ApiUser>('/auth/me');
