# AWS Lambda Router
A simple router for AWS Lambda functions and Serverless framework built with TypeScript.

## Basic Usage
```
import { Router } from '@dontepsu/aws-lambda-router';

const router = new Router();
router.route({
  path: '/my-path',
  method: 'GET',
  handler: (event, context) => {
    return { success: true };
  };
});
```

## Concat Routers
```
import { Router } from '@dontepsu/aws-lambda-router';

const usersRouter = new Router('/car');
usersRouter.get('/{id}', event => getCar(event.pathParameters.id))

const todoRouter = new Router('/todo');
todoRouter.post('', event => addTodo(JSON.parse(event.body)))

const router = new Router();
router
  .concat(usersRouter)
  .concat(todoRouter);
```

## Error handling
Documentation to do. You can use Boom errors or errorDeclartion for routes. See code.