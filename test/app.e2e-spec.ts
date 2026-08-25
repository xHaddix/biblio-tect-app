import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/auth/register (POST) rechaza body inválido', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'no-es-un-email' })
      .expect(400);
  });

  it('/auth/login (POST) rechaza credenciales inexistentes', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'no-existe@example.com', password: 'password123' })
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
