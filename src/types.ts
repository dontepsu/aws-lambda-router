import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Boom from '@hapi/boom';

export type RouteHandler<T> = (event: APIGatewayProxyEvent, context: Context) => Promise<T>;
export type SupportedHttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type CacheType = 'must-revalidate' | 'no-cache' | 'no-store' | 'no-transform' |
  'public' | 'private' | 'proxy-revalidate' | 'max-age' | 's-maxage';

export interface ErrorDeclaration {
  type: any;
  statusCode: number;
  message?: string;
}

export interface Routes {
  [propName: string]: {
    [key in SupportedHttpVerb]?: RouteConfig;
  };
}

export interface RouterConfig {
  prefix?: string;
  headers?: {};
  onInvoke? <T> (event: APIGatewayProxyEvent, context: Context): Promise<T>;
  onError? (error: Boom.Boom): Promise<void>;
}
export interface RouteConfig<T = any> extends RouteOptions {
  method: SupportedHttpVerb;
  path: string;
  handler: RouteHandler<T>;
}

export interface RouteOptions {
  errors?: ErrorDeclaration[];
  statusCode?: number;
  cache?: {
    cacheType: CacheType[];
    age: number;
  };
  headers?: {};
}
