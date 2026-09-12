import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { loginAsNewGoogleUser } from './utils/login.js';

vi.mock('../src/auth/google-verifier.js', () => ({
  verifyGoogleAccessToken: vi.fn(async (token: string) => ({ email: token.replace('fake-token-for-', '') })),
}));

describe('Events (e2e)', () => {
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

  it('creates an event and shows it on the board with computed seatsFilled', async () => {
    const { token } = await loginAsNewGoogleUser(app, `events-host-${Date.now()}@example.com`);

    const create = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test board event', date: new Date().toISOString(), seatsTotal: 4 })
      .expect(201);

    const eventId = create.body.id;

    const board = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const found = board.body.find((e: { id: string }) => e.id === eventId);
    expect(found).toBeTruthy();
    expect(found.seatsFilled).toBe(0);
    expect(found.going).toEqual([]);

    const hosted = await request(app.getHttpServer())
      .get('/events/mine/hosted')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(hosted.body.some((e: { id: string }) => e.id === eventId)).toBe(true);
  });

  it('lets only the host archive an event', async () => {
    const { token: hostToken } = await loginAsNewGoogleUser(app, `events-host2-${Date.now()}@example.com`);
    const { token: strangerToken } = await loginAsNewGoogleUser(app, `events-stranger-${Date.now()}@example.com`);

    const create = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'Archive me', date: new Date().toISOString(), seatsTotal: 2 });
    const eventId = create.body.id;

    await request(app.getHttpServer())
      .post(`/events/${eventId}/archive`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/archive`)
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(201);
  });
});
