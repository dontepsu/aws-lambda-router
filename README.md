# AWS Lambda Router
A simple router for AWS Lambda functions and Serverless framework built with TypeScript.

## Usage
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