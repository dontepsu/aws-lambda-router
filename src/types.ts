import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as Boom from '@hapi/boom';

export type RouteHandler<Response = any, AppContext = any> = (
  event?: APIGatewayProxyEvent,
  apiGWContext?: Context,
  context?: AppContext,
) => Promise<Response>;
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
  onInvoke? (event?: APIGatewayProxyEvent, context?: Context): Promise<any>;
  onError? (error: Boom.Boom): Promise<void>;
  context? (event?: APIGatewayProxyEvent, context?: Context): Promise<any>;
}
export interface RouteConfig<Response = any, AppContext = any> extends RouteOptions {
  method: SupportedHttpVerb;
  path: string;
  handler: RouteHandler<Response, AppContext>;
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
