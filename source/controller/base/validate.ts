
// outsource dependencies
import * as _is from 's-is';
import { get } from 'lodash';
import { Request, Response } from 'express';

// local dependencies
import Controller from './index';
import { ValidateOptions, checkFn, checkFormatterFn } from './interface';

/**
 * Intercept action and execute validation check
 * on check fail send validation error
 * on check success continue execution of endpoint
 *
 * @example
 * export default class My extends Controller {
 *     @Validate([
 *         is.countable.required('body.id'),
 *         is.countable.defaults('body.age', 16)
 *     ])
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export function Validate (options: ValidateOptions ) {
    return (target: Controller, property: string, descriptor: any) => {
        return {
            value: async (request: Request, response: Response) => {
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE care about previous check
                if ( !target.authorized ) {
                    // TODO common validate method from Controller
                    await target._validate.call(target, request, response, options);
                }
                // NOTE care about status of response
                if ( response.headersSent ) { return; }
                // NOTE continue executing endpoint
                return descriptor.value.call(target, request, response);
            }
        };
    };
}

const unknownMsg = 'unknown property path';

/**
 * Validation helper
 * implement validation helps
 *
 */
class Is {
    public static create (name: string, check: checkFn) { return new Is(name, check); }
    private constructor (private name: string, private check: checkFn) {}

    // public required (path: string) {

    // }

    protected __required (value: any, path: string = unknownMsg): string | null {
        console.log('required', this);
        if ( !this.check(value) ) {
            return `Property ${path} is required and should be a ${this.name}`;
        }
        return null;
    }

    protected __defaults (def: any): checkFormatterFn {
        const self = this;
        // NOTE unknown reason TypeScript do not care about context of returned arrow function ...
        return (value: any = def, path: string = unknownMsg): string | null => {
            console.log('defaults', self);
            if ( !self.check(value) ) {
                return `Property ${path} is option but should be a ${self.name} if present`;
            }
            return null;
        };
    }
}

// NOTE make aliases
export const string = Is.create('String', _is.string);
export const isString = string;

export const number = Is.create('Number', _is.number);
export const isNumber = number;

export const countable = Is.create('Countable', _is.countable);
export const isCountable = countable;

export default {
    Validate,
    string,
    number,
    countable,
};
