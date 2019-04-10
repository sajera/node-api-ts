
// outsource dependencies
import * as _is from 's-is';
import { get } from 'lodash';

// local dependencies
import Controller from './index';
import { ValidateOptions, checkFn, checkFormatterFn } from './interface';

const unknownMsg = 'unknown property path';

class Is {
    public static create (name: string, check: checkFn) { return new Is(name, check); }
    private constructor (private name: string, private check: checkFn) {}

    public required (value: any, path: string = unknownMsg): string | null {
        console.log('required', this);
        if ( !this.check(value) ) {
            return `Property ${path} is required and should be a ${this.name}`;
        }
        return null;
    }

    public defaults (def: any): checkFormatterFn {
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
    string,
    number,
    countable,
};
