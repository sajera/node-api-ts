// outsource dependencies
import * as jwt from 'jsonwebtoken';
// local dependencies
import { Logger } from './logger';
import { JWT_SECRET } from '../constant';

/**
 * Symmetric JWT Token
 */
export class JwtToken<T> {
  // FIXME is it useful to specify the secret for each token builder? ?
  private readonly secret = JWT_SECRET;

  private readonly signOptions: jwt.SignOptions = {
    algorithm: 'HS256'
  };

  private readonly verifyOptions: jwt.VerifyOptions = {
    // algorithms: ['HS256', 'HS384', 'HS512'],
    ignoreExpiration: false,
    clockTolerance: 3 * 60, // 3min
  };

  private constructor (signOptions: jwt.SignOptions, verifyOptions: jwt.VerifyOptions) {
    if (!this.secret) {
      this.secret = 'Some default hardcoded secret, to make sure the security enabled';
      Logger.error('TOKEN', 'Secret is missing. Switching to default secret');
    }
    this.signOptions = { ...this.signOptions, ...signOptions };
    this.verifyOptions = { ...this.verifyOptions, ...verifyOptions };
  }

  /**
   * secret algorithms only 'HS256'|'HS384'|'HS512'
   * expiresIn @see https://www.npmjs.com/package/jsonwebtoken#token-expiration-exp-claim
   */
  public static create<T> ({ expiresIn = '1h', algorithm = 'HS256', algorithms }: { expiresIn?: string, algorithm?: 'HS256'|'HS384'|'HS512', algorithms?: jwt.Algorithm[] }) {
    return new JwtToken<T>(
      { expiresIn, algorithm },
      { algorithms: algorithms || [algorithm], maxAge: expiresIn },
    );
  }

  /**
   * verify the sign and expiration time get data from token
   */
  public verify (token: string): T {
    return <T>jwt.verify(token, this.secret, this.verifyOptions);
  }

  /**
   * get data from token
   */
  public decode (token: string): T {
    return <T>jwt.decode(token, this.verifyOptions);
  }

  /**
   * create signed token
   */
  public sign (data: T): string {
    return jwt.sign(data as jwt.JwtPayload, this.secret, this.signOptions);
  }
}
