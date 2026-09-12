import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { loginAsNewGoogleUser } from './utils/login.js';

vi.mock('../src/auth/google-verifier.js', () => ({
  verifyGoogleAccessToken: vi.fn(async (token: string) => ({ email: token.replace('fake-token-for-', '') })),
}));

describe('JoinRequests (e2e)', () => {
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

  it('rejects approving past an event capacity of 1', async () => {
    const stamp = Date.now();
    const { token: hostToken } = await loginAsNewGoogleUser(app, `jr-host-${stamp}@example.com`);
    const { token: attendeeAToken } = await loginAsNewGoogleUser(app, `jr-a-${stamp}@example.com`);
    const { token: attendeeBToken } = await loginAsNewGoogleUser(app, `jr-b-${stamp}@example.com`);

    const create = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'One seat only', date: new Date().toISOString(), seatsTotal: 1, entryMode: 'APPROVE' });
    const eventId = create.body.id;

    const reqA = await request(app.getHttpServer())
      .post(`/events/${eventId}/join-requests`)
      .set('Authorization', `Bearer ${attendeeAToken}`)
      .send({ introText: 'me first' })
      .expect(201);
    expect(reqA.body.status).toBe('PENDING');

    const reqB = await request(app.getHttpServer())
      .post(`/events/${eventId}/join-requests`)
      .set('Authorization', `Bearer ${attendeeBToken}`)
      .send({ introText: 'me too' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/join-requests/${reqA.body.id}/decide`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ decision: 'APPROVED' })
      .expect(200)
      .expect((res) => {
        if (res.body.status !== 'APPROVED') throw new Error('expected first approval to succeed');
      });

    await request(app.getHttpServer())
      .patch(`/join-requests/${reqB.body.id}/decide`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ decision: 'APPROVED' })
      .expect(409);

    // A non-host can't decide at all.
    await request(app.getHttpServer())
      .patch(`/join-requests/${reqB.body.id}/decide`)
      .set('Authorization', `Bearer ${attendeeAToken}`)
      .send({ decision: 'DECLINED' })
      .expect(403);
  });

  it('auto-approves join requests on OPEN entry events', async () => {
    const stamp = Date.now();
    const { token: hostToken } = await loginAsNewGoogleUser(app, `jr-open-host-${stamp}@example.com`);
    const { token: attendeeToken } = await loginAsNewGoogleUser(app, `jr-open-a-${stamp}@example.com`);

    const create = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'Open door', date: new Date().toISOString(), seatsTotal: 5, entryMode: 'OPEN' });

    const req = await request(app.getHttpServer())
      .post(`/events/${create.body.id}/join-requests`)
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({})
      .expect(201);

    expect(req.body.status).toBe('APPROVED');
  });
});
