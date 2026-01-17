import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Customers (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /customers - should create a customer', async () => {
        const customerData = {
            email: 'test@agent.com',
            name: 'Agent Smith',
        };

        const response = await request(app.getHttpServer())
            .post('/customers')
            .send(customerData)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(customerData.email);
        expect(response.body.name).toBe(customerData.name);
    });

    it('GET /customers - should return all customers', async () => {
        const response = await request(app.getHttpServer())
            .get('/customers')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});
