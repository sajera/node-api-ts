// outsource dependencies
import * as jwt from 'jsonwebtoken'
// local dependencies
import { Logger } from './logger';
import { JWT_SECRET } from '../constant';


class Token {
  private readonly secret = JWT_SECRET // same secret for all tokens
  private readonly signOptions: jwt.SignOptions
  private readonly verifyOptions: jwt.VerifyOptions = {
    // algorithms: ['HS256', 'HS384', 'HS512'],
    ignoreExpiration: false,
    clockTolerance: 3 * 60, // 3min
  }

  private constructor (signOptions: jwt.SignOptions, verifyOptions: jwt.VerifyOptions) {
    if (!this.secret) {
      this.secret = '¯\_(ツ)_/¯'
      Logger.error('TOKEN', 'Secret is missing. Switching to default secret');
    }
    this.signOptions = { ...this.signOptions, ...signOptions }
    this.verifyOptions = { ...this.verifyOptions, ...verifyOptions }
  }

  /**
   * secret algorithm only 'HS256'|'HS384'|'HS512'
   */
  public static create ({ expiresIn = '1h', algorithm = 'HS256', algorithms }: { expiresIn?: string, algorithm?: 'HS256'|'HS384'|'HS512', algorithms?: jwt.Algorithm[] }) {
    return new Token(
      { expiresIn, algorithm },
      { algorithms: algorithms || [algorithm], maxAge: expiresIn },
    )
  }

  /**
   * verify the sign algorithm and expiration time
   */
  public isValid (token: string): boolean {
    try {
      const decoded = this.parse(token)
      // TODO expiration checked ??
      return Boolean(decoded);
    } catch (error) {
      return false
    }
  }

  public parse (token: string) {
    return jwt.verify(token, this.secret, this.verifyOptions)
  }

  public sign<T> (data: Partial<T>): string {
    return jwt.sign(data, this.secret, this.signOptions);
  }
}

// NOTE create server instance
export { Token };
export default Token;
