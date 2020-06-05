import { Router } from './router';
import { APIGatewayProxyEvent } from 'aws-lambda';

const createEvent = (partial: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => {
  return partial as APIGatewayProxyEvent;
};

interface TestApplicationContext {
  testValue?: string;
  nestedValue?: string;
}

test('Router', async () => {
  const router: Router = new Router();
  const fooHandler = jest.fn(async (event) => {
    return {
      foo: 'foo',
    };
  });

  router.get('/foo', fooHandler);

  const event = createEvent({
    resource: '/foo',
    httpMethod: 'GET',
  });

  const response = await router.handler(event, {} as any);

  expect(response.statusCode).toEqual(200);
  expect(JSON.parse(response.body)).toEqual({
    foo: 'foo',
  });
});

test('Router with app context', async () => {
  const router: Router = new Router({
    async context (): Promise<TestApplicationContext> {
      return {
        testValue: 'bar',
      };
    },
  });

  const fooHandler = jest.fn(async (_event, _context, context) => {
    return {
      foo: 'foo',
      testValue: context.testValue,
    };
  });

  router.get('/foo', fooHandler);

  const event = createEvent({
    resource: '/foo',
    httpMethod: 'GET',
  });

  const response = await router.handler(event, {} as any);

  expect(response.statusCode).toEqual(200);
  expect(JSON.parse(response.body)).toEqual({
    foo: 'foo',
    testValue: 'bar',
  });
});

test('Nested Router with app context', async () => {
  const router: Router = new Router({
    prefix: '/api',
    async context (): Promise<TestApplicationContext> {
      return {
        testValue: 'bar',
      };
    },
  });

  const nestedRouter = new Router();

  const fooHandler = jest.fn(async (_event, _context, context) => {
    return {
      foo: 'foo',
      testValue: context.testValue,
    };
  });

  nestedRouter.get('/foo', fooHandler);

  const handler = router.concat(nestedRouter).handler;

  const event = createEvent({
    resource: '/api/foo',
    httpMethod: 'GET',
  });

  const response = await handler(event, {} as any);

  console.log(response.body);
  expect(response.statusCode).toEqual(200);
  expect(JSON.parse(response.body)).toEqual({
    foo: 'foo',
    testValue: 'bar',
  });
});
