
// outsource dependencies
import { Request, Response, NextFunction } from 'express';

// local dependencies
import { METHOD } from './const';

// cycle: string[] | Array<(request: Request, response: Response) => void>
export type endpointFn = ((request: Request, response: Response) => Promise<any>);
export type middlewareFn = ((request: Request, response: Response, next: NextFunction) => void);
export type errorMiddlewareFn = ((error: Error, request: Request, response: Response, next: NextFunction) => void);

export interface RoutOptions {
    path: string;
    method: METHOD;
    action: string;
}

export interface PermissionOptions {
    any?: any;
    // TODO add more options
}

export interface ValidateOptions {
    body: any;
    query: any;
    params: any;
}
