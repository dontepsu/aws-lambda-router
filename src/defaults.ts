import { ErrorDeclaration, } from './types';

export const defaultErrorDeclaration: ErrorDeclaration = {
  statusCode: 500,
  type: Error,
  message: 'Internal server error',
};
