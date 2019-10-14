import { APIGatewayProxyHandler } from 'aws-lambda';
import { RouteHandler, RouterConfig, RouteConfig, RouteOptions } from './types';
export declare class Router {
    private config;
    private routes;
    constructor(config?: RouterConfig);
    handler(): APIGatewayProxyHandler;
    route(config: RouteConfig): void;
    get<T>(path: string, handler: RouteHandler<T>, options?: RouteOptions): void;
    private getRoute;
    private buildCacheHeaders;
    private createResponse;
    private handleError;
}
