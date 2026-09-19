import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { JoinRequestsModule } from './join-requests/join-requests.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { ReviewReportsModule } from './review-reports/review-reports.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { DeviceTokensModule } from './device-tokens/device-tokens.module.js';
import { JobsModule } from './jobs/jobs.module.js';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    JoinRequestsModule,
    ChatModule,
    ReviewsModule,
    ReviewReportsModule,
    NotificationsModule,
    DeviceTokensModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
