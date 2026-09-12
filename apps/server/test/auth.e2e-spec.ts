import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

vi.mock('../src/auth/google-verifier.js', () => ({
  verifyGoogleAccessToken: vi.fn(async (token: string) => ({ email: token.replace('fake-token-for-', '') })),
}));

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in with Google and issues a JWT', async () => {
    const email = `auth-spec-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/google')
      .send({ accessToken: `fake-token-for-${email}` })
      .expect(201);

    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe(email);
  });

  it('rejects /auth/me without a token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('accepts /auth/me with a valid token', async () => {
    const email = `auth-spec-${Date.now()}@example.com`;
    const login = await request(app.getHttpServer())
      .post('/auth/google')
      .send({ accessToken: `fake-token-for-${email}` });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect((res) => {
        if (res.body.email !== email) throw new Error('unexpected user in /auth/me response');
      });
  });
});
