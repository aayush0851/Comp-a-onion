import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function loginAsNewGoogleUser(app: INestApplication, email: string) {
  const res = await request(app.getHttpServer()).post('/auth/google').send({ accessToken: `fake-token-for-${email}` });
  return { token: res.body.accessToken as string, user: res.body.user };
}
