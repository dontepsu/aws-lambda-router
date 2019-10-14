import * as Boom from '@hapi/boom';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { CacheType, SupportedHttpVerb, ErrorDeclaration, RouteHandler, Routes, RouterConfig, RouteConfig, RouteOptions } from './types';
import { defaultErrorDeclaration } from './defaults';

export class Router {
  private routes: Routes = {};

  constructor (private config: RouterConfig = {}) {}

  get handler (): APIGatewayProxyHandler {
    return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      context.callbackWaitsForEmptyEventLoop = false;
      let route: RouteConfig;
      try {
        route = this.getRoute(event.path, event.httpMethod as SupportedHttpVerb);
      } catch (error) {
        return {
          statusCode: error.statusCode,
          body: JSON.stringify(error.toString()),
          headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Credentials' : true,
          },
        };
      }
      try {
        if (this.config.onInvoke) {
          await this.config.onInvoke(event, context);
        }
        const resp = await route.handler(event, context);

        return this.createResponse(route, resp);
      } catch (error) {
        return this.handleError(route.errors || [])(error);
      }
    };
  }

  route (config: RouteConfig): void {
    if (!this.routes[config.path]) {
      this.routes[config.path] = {};
    }

    this.routes[config.path][config.method] = config;
  }

  get<T> (path: string, handler: RouteHandler<T>, options: RouteOptions = {}): void {
    this.route({
      path,
      handler,
      method: 'GET',
      ...options,
    });
  }

  post<T> (path: string, handler: RouteHandler<T>, options: RouteOptions = {}): void {
    this.route({
      path,
      handler,
      method: 'POST',
      ...options,
    });
  }

  put<T> (path: string, handler: RouteHandler<T>, options: RouteOptions = {}): void {
    this.route({
      path,
      handler,
      method: 'PUT',
      ...options,
    });
  }

  delete<T> (path: string, handler: RouteHandler<T>, options: RouteOptions = {}): void {
    this.route({
      path,
      handler,
      method: 'DELETE',
      ...options,
    });
  }

  patch<T> (path: string, handler: RouteHandler<T>, options: RouteOptions = {}): void {
    this.route({
      path,
      handler,
      method: 'PATCH',
      ...options,
    });
  }

  private getRoute (path: string, method: SupportedHttpVerb): RouteConfig {
    if (!this.routes[path] || !this.routes[path][method]) {
      throw Boom.internal('Route not found');
    }

    return this.routes[path][method] as RouteConfig;
  }

  private buildCacheHeaders ({ cacheTypes = [], age = 3600, headers = {} }: { cacheTypes?: CacheType[]; age?: number; headers?: any; } = {}) {
    const cacheHeaders = cacheTypes.map(type => {
      let cacheHeader = type;
      if (type === 'max-age' || type === 's-maxage') {
        cacheHeader += '=' + age;
      }
      return cacheHeader;
    });

    headers['cache-control'] = cacheHeaders.join(', ');

    return headers;
  }

  private createResponse (routeConfig: RouteConfig, response: any) {
    const { cache = { cacheType: [], age: 3600 }, headers = {} } = routeConfig;
    return {
      statusCode: routeConfig.statusCode || 200,
      body: JSON.stringify(response),
      headers: this.buildCacheHeaders({
        cacheTypes: cache.cacheType, age: cache.age, headers: {
          ...(this.config.headers || {}),
          ...headers,
          // TODO BETTER CORS
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
      }),
    };
  }
  private handleError (errors: ErrorDeclaration[]) {
    return async (err: any): Promise<APIGatewayProxyResult> => {
      console.log(err.toString());
      console.log(JSON.stringify(err.stack));

      if (Boom.isBoom(err)) {
        if (err.data.onError) {
          try {
            await err.data.onError();
          } catch (e) {
            console.log('strouter: error.onError failed', e.toString(), JSON.stringify(e));
          }
        }
      } else {
        const errorDeclaration = errors.find(e => {
          if (typeof e.type === 'object' || typeof e.type === 'function') {
            return err instanceof e.type;
          }
          return err.name === e.type || e.message === e.type;
        }) || defaultErrorDeclaration;

        err = Boom.boomify(err, { statusCode: errorDeclaration.statusCode, message: errorDeclaration.message });
      }

      if (this.config.onError) {
        try {
          await this.config.onError(err);
        } catch (e) {
          console.log('strouter: config.onError failed', e.toString(), JSON.stringify(e));
        }
      }

      return {
        statusCode: err.statusCode,
        body: JSON.stringify(err.toString()),
        headers: {
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Credentials' : true,
        },
      };
    };
  }
}
