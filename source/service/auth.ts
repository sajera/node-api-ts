// outsource dependencies

// local dependencies
import { Logger } from './logger';
import { JwtToken } from './jwt-token';

// JSON Web Token Claims @see https://www.iana.org/assignments/jwt/jwt.xhtml
interface TokenPayload {
  sid: string; // session ID in order to pair the tokens (access/refresh)
  sub: string; // that is a userId <-> "sub" (Subject) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  iss: string; // that is a client <-> "iss" (Issuer) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  // FIXME might be useful in case the token will be parsed from UI side in order to reduce amount of initial requests
  name?: string;
  email?: string;
  roles?: string[];
}
namespace AuthService {
  export interface AccessTokenPayload extends TokenPayload {}
  export interface RefreshTokenPayload extends TokenPayload {}
  export interface Self {
    // TODO def
  }
}

class AuthService {
  private readonly type = 'Bearer'
  private readonly typeReplacer = /^Bearer /
  private readonly access = JwtToken.create<AuthService.AccessTokenPayload>({ expiresIn: '1hour' })
  private readonly refresh = JwtToken.create<AuthService.RefreshTokenPayload>({ expiresIn: '1month' })

  private constructor () {
    Logger.log('AUTH', 'service TODO');
  }

  // NOTE is singleton
  private static instance: AuthService;
  public static create () { this.instance = new AuthService() }

  /**
   * lightweight verification of token - check sign and expiration
   * @param header
   */
  public static getAuthAccessSync (header: string): AuthService.AccessTokenPayload {
    const token = header.replace(this.instance.typeReplacer, '')
    return this.instance.access.verify(token)
  }

  /**
   * lightweight verification of token will check sign, expiration and check DB record
   * @param header
   */
  public static async getAuthAccess (header: string): Promise<AuthService.AccessTokenPayload> {
    const auth = this.getAuthAccessSync(header)
    // TODO check DB record
    Logger.important('AUTH', 'check DB record not implemented yet')
    return auth
  }

  /**
   * get self user data
   * @param auth
   */
  public static async getSelf (auth: AuthService.AccessTokenPayload): Promise<AuthService.Self> {
    // TODO get from DB
    Logger.important('AUTH', 'Get "self" not implemented yet')
    return { id: 100500, firstName: 'The', lastName: 'User', email: 'the@user.email' }
  }

  public static async createAuth (payload: TokenPayload) {
    // NOTE for now the payload same - in future with huge probability it should be mapped
    const access = payload
    const refresh = payload
    const auth = {
      type: this.instance.type,
      accessToken: this.instance.access.sign(access),
      refreshToken: this.instance.refresh.sign(refresh),
    }
    // TODO record "auth" into DB
    return auth
  }

  public static async initialize () {
    // TODO connect DB
  }

}

// NOTE create server instance
AuthService.create();
export { AuthService };
export default AuthService;
