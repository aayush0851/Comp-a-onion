import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { loginAsNewGoogleUser } from './utils/login.js';

vi.mock('../src/auth/verifiers/google-verifier.js', () => ({
  verifyGoogleAccessToken: vi.fn(async (token: string) => ({ email: token.replace('fake-token-for-', '') })),
}));

describe('Reviews (e2e)', () => {
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

  it('submits a review, blocks a duplicate, and recomputes the reviewee rating', async () => {
    const stamp = Date.now();
    const { token: hostToken, user: host } = await loginAsNewGoogleUser(app, `rv-host-${stamp}@example.com`);
    const { token: reviewerToken } = await loginAsNewGoogleUser(app, `rv-reviewer-${stamp}@example.com`);

    const create = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'Reviewable post', date: new Date().toISOString(), seatsTotal: 5 });
    const postId = create.body.id;

    const reviewBody = {
      setupScores: { venue: 5 },
      setupTags: ['Good hang'],
      personReviews: [{ revieweeId: host.id, rating: 5, tags: ['Easy to talk to'], meetAgain: true }],
    };

    await request(app.getHttpServer())
      .post(`/posts/${postId}/reviews`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send(reviewBody)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/posts/${postId}/reviews`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send(reviewBody)
      .expect(409);

    const mine = await request(app.getHttpServer())
      .get(`/posts/${postId}/reviews/mine`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .expect(200);
    expect(mine.body).toBeTruthy();

    const hostProfile = await request(app.getHttpServer())
      .get(`/users/${host.id}`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .expect(200);
    expect(hostProfile.body.aggregatedRating).toBe(5);
  });
});
