import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoSanitize from 'express-mongo-sanitize';
import { expressCspHeader, SELF, NONE } from 'express-csp-header';
import * as hsts from 'hsts';
 import helmet from 'helmet';
 
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowlist = ['http://localhost:4200', 'http://localhost:4200'];
  const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true };
    } else {
      corsOptions = { origin: false };
    }
    callback(null, corsOptions);
  };

  app.use(cors(corsOptionsDelegate));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(mongoSanitize());

  app.use(
    expressCspHeader({
      directives: {
        'default-src': [SELF],
        'object-src': [NONE],
        'require-trusted-types-for': "'script'",
      },
    }),
  );

  app.use(
    hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`],
          frameSrc: [`'self'`],
        },
      },
    }),
  );

  await app.listen(3000);
}
 
bootstrap();
 