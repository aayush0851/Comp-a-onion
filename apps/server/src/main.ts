import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  // Express auto-generates ETags and answers matching conditional GETs with an
  // empty 304 body. The mobile client has no HTTP cache to serve that from, so
  // every GET's res.json() saw "" and threw. This is a JSON API, not a browser
  // asset server — disable the caching behavior entirely.
  app.getHttpAdapter().getInstance().set('etag', false);

  const logger = new Logger('HTTP');
  app.use((req: any, res: any, next: () => void) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
