// outsource dependencies
import * as yup from 'yup';
import * as _ from 'lodash';

// local dependencies
import { Logger } from './logger';

// configure
const OPT = { abortEarly: false, recursive: true };

namespace Yup {
  export interface ValidationSchema<Schema> {
    (values: unknown): yup.ValidationError|void
  }
}

export class Yup<Schema> {
  private readonly OPT: yup.ValidateOptions = {
    // stripUnknown: true, // note sure
    abortEarly: false,
    recursive: true,
  };

  constructor (private schema: yup.AnySchema, options?: yup.ValidateOptions) {
    options && (this.OPT = { ...this.OPT, ...options });
  }

  public validate (values): yup.ValidationError|void {
    try {
      this.schema.validateSync(values, this.OPT);
    } catch (error) {
      return Yup.errorToOutput(error as yup.ValidationError);
    }
  }

  public validateAsync (values): Promise<yup.ValidationError|void> {
    return this.schema.validate(values, OPT)
      .then(() => {})
      .catch(Yup.errorToOutput);
  }

  private static errorToOutput (error: yup.ValidationError): yup.ValidationError|void {
    // NOTE most simple way to know the yup was thrown ¯\_(ツ)_/¯
    if (error?.name !== 'ValidationError') {
      return Logger.debug('YUP', 'Failed to validate', error.message);
    }
    const inner = error?.inner;
    const result = {} as yup.ValidationError;
    _.map(inner, (nestedError: yup.ValidationError) => {
      const path = nestedError?.path;
      const inner = nestedError?.inner;
      let message: yup.ValidationError|string = nestedError?.message;
      // FIXME allow deep form schema
      _.size(inner) && (message = Yup.errorToOutput(nestedError) as yup.ValidationError)
      _.set(result, path, message);
    });
    // Logger.debug('YUP', 'errorToOutput result', result);
    // Logger.debug('YUP', 'errorToOutput inner', inner);
    return result;
  }

  /**
   * there is know and expected each validator will work only with object schemas
   */
  public static create (options) { return new Yup(yup.object().shape(options)); }

  /*******************************************************************
   *        Predefined reusable validators
   * take in mind the mandatory check better to add on the form itself
   *                      ¯\_(ツ)_/¯
   *******************************************************************/

  public static readonly DATE = yup.date().nullable().strict();

  public static readonly INT = yup.number().transform((value, originalValue) => Number(originalValue)).nullable();

  public static readonly NUMBER = yup.number().nullable().strict();

  public static readonly POSITIVE = this.NUMBER.min(1, 'Should be positive');

  // eslint-disable-next-line no-useless-escape,max-len
  // const portRegExp = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
  // const PORT = STRING.matches(portRegExp, 'Incorrect Port number');
  public static readonly PORT = this.NUMBER.min(0, 'Should be bigger then 0').max(65535, 'Should be less 65535');

  public static readonly STRING = yup.string().nullable().strict();
  // @see {@link https://estative.atlassian.net/browse/EST-681}
  // .trim('Shouldn\'t contain whitespaces at start and end of text');

  public static readonly EMAIL = this.STRING.email('Please type valid email');

  public static readonly PASSWORD = this.STRING
    .min(8, 'Password should be at least 8 characters in a length')
    .matches(/[0-9]/, 'Password should contain at least one numeric character')
    .matches(/[!@#$%^&*)(+=._-]/, 'Password should contain at least one special character')
    .matches(/[a-z]/, 'Password should contain at least one lowercase character')
    .matches(/[A-Z]/, 'Password should contain at least one uppercase character');

  // eslint-disable-next-line no-useless-escape,max-len
  public static readonly urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

  public static readonly URL = this.STRING.matches(this.urlRegExp, 'Please enter correct website url');

  public static readonly NAME = () => this.STRING
    .min(2, 'Should be at least 2 characters in a length')
    .max(16, 'Should be at less than 16 characters in a length');

  public static readonly TITLE = this.STRING
    .min(3, 'Should be at least 3 characters in a length')
    .max(256, 'Should be at less than 256 characters in a length');

  public static readonly DESCRIPTION = this.STRING
    .min(3, 'Should be at least 3 characters in a length')
    .max(2000, 'Should be at less than 2000 characters in a length');

}
