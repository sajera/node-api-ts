// outsource dependencies
import * as express from 'express';

// local dependencies
import { Token } from './token';
import { Logger } from './logger';

// JSON Web Token Claims @see https://www.iana.org/assignments/jwt/jwt.xhtml
export interface TokenPayload {
  sid: string; // session ID in order to pair the tokens (access/refresh)
  sub: string; // that is a userId <-> "sub" (Subject) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  iss: string; // that is a client <-> "iss" (Issuer) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  // FIXME might be useful in case the token will be parsed from UI side in order to reduce amount of initial requests
  name?: string;
  email?: string;
  roles?: string[];
}
export interface AccessTokenPayload extends TokenPayload {}
export interface RefreshTokenPayload extends TokenPayload {}

class AuthService {
  private readonly type = 'Bearer'
  private readonly typeReplacer = /^Bearer /
  private readonly access = Token.create<AccessTokenPayload>({ expiresIn: '1hour' })
  private readonly refresh = Token.create<RefreshTokenPayload>({ expiresIn: '1month' })

  private constructor () {
    Logger.log('AUTH', 'service TODO');
  }

  // NOTE is singleton
  private static instance: AuthService;
  public static create () { this.instance = new AuthService() }


  /**
   * lightweight verification of token will check sign and expiration
   * @param header
   */
  public static getAuthAccess (header: string): TokenPayload {
    const token = header.replace(this.instance.typeReplacer, '')
    return this.instance.access.parse(token)
  }

  /**
   *
   * @param header
   */
  public static async getAuthUser (header: string): Promise<TokenPayload> {
    const token = header.replace(this.instance.type, '')
    // FIXME Is useful to verify "auth" within DB ?
    return this.instance.access.parse(token)
  }

  public static async createAuth (payload: TokenPayload) {
    // NOTE for now the payload same - in future with huge probability it should be mapped
    const access = payload
    const refresh = payload
    const auth = {
      type: this.instance.type,
      accessToken: this.instance.access.create(access),
      refreshToken: this.instance.refresh.create(refresh),
    }
    // TODO record "auth" into DB
    return auth
  }

  /**
   * token verification
   */
  public static checkTokenSign (authorization: string): boolean {

    return true
  }

  public static async initialize () {
    // TODO connect DB
  }

}

// NOTE create server instance
AuthService.create();
export { AuthService };
export default AuthService;
