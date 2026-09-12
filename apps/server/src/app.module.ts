import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { EventsModule } from './events/events.module.js';
import { JoinRequestsModule } from './join-requests/join-requests.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { ReviewReportsModule } from './review-reports/review-reports.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { DeviceTokensModule } from './device-tokens/device-tokens.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    JoinRequestsModule,
    ChatModule,
    ReviewsModule,
    ReviewReportsModule,
    NotificationsModule,
    DeviceTokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
