// outsource dependencies
import * as bcrypt from 'bcryptjs'
import { createHmac } from 'node:crypto'
// local dependencies
import { Logger } from './logger';
import { JwtToken } from './jwt-token';
import { PWD_SALT, PWD_HASH, SID_SECRET } from '../constant';

// JSON Web Token Claims @see https://www.iana.org/assignments/jwt/jwt.xhtml
interface TokenPayload {
  sid: string; // session ID in order to pair the tokens (access/refresh) with specified user
  // FIXME is that mandatory to define difference between sessions from different devices ?
  // sub: string; // that is a userId <-> "sub" (Subject) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  // iss: string; // that is a client <-> "iss" (Issuer) Claim @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1
  // FIXME might be useful in case the token will be parsed from UI side in order to reduce amount of initial requests
  name?: string;
  roles?: string[];
  // FIXME is it safe for users ?
  // email?: string;
}
namespace AuthService {
  export interface AccessTokenPayload extends TokenPayload {}
  export interface RefreshTokenPayload extends TokenPayload {}
  export interface Auth extends TokenPayload {
    refreshToken: string;
    accessToken: string;
    schema: string;
    userId: string|number;
    // NOTE allow to pass some-thing
    payload?: unknown
  }
  export interface Self {
    // TODO define
  }
}

class AuthService {
  private readonly schema = 'bearer'
  private readonly schemaReplacer = /^Bearer /i
  private readonly access = JwtToken.create<AuthService.AccessTokenPayload>({ expiresIn: '1m' })
  private readonly refresh = JwtToken.create<AuthService.RefreshTokenPayload>({ expiresIn: '7d' })

  private constructor () {
    Logger.log('AUTH', 'service TODO');
  }

  /**
   * TODO
   * generate password hash to avoid passing it into DB or to know what it is
   */
  private async encryptPassword (password: string): Promise<string> {
    // FIXME should we use predefined salt ?
    const saltOrHashRounds = PWD_SALT || PWD_HASH || 10;
    // FIXME how much rounds we may allow to generate random hash
    // const salt = await bcrypt.genSalt(PWD_HASH);
    return await bcrypt.hash(password, saltOrHashRounds);
  }

  /**
   * TODO
   * ability to compare password with hash to know they equal
   */
  private async comparePassword (password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  /**
   * create session ID by encrypt user ID to avoid compromising
   * NOTE by changing the salt we may invalidate all current session
   */
  private sid (id: string|number): string {
    // NOTE mandatory to use predefined salt on order to define relation session with user
    const hmac = createHmac('sha256', SID_SECRET || 'sid');
    return hmac.update(String(id)).digest('hex');
  }

  // NOTE is singleton
  private static instance: AuthService;
  public static create () { this.instance = new AuthService() }

  /**
   * lightweight verification of token - check sign and expiration
   * @param header
   */
  public static verifyAuthAccess (header: string): AuthService.AccessTokenPayload {
    const token = header.replace(this.instance.schemaReplacer, '')
    return this.instance.access.verify(token)
  }

  /**
   *
   */
  public static async getAuth (auth: AuthService.AccessTokenPayload): Promise<AuthService.Auth> {
    Logger.important('AUTH', 'get "auth" from Redis not implemented yet')
    // TODO get "auth" from Redis
    return {
      accessToken: '',
      name: '',
      refreshToken: '',
      roles: [],
      schema: '',
      sid: '',
      userId: undefined
    }
  }

  /**
   * create pseudo-session - allow to pass there some payload
   * @param userId
   * @param payload
   */
  public static async createAuth (userId: string|number, payload) {
    const sid = this.instance.sid(userId);
    const tokenPayload = { sid, name: 'not in use', roles: ['will', 'be', 'implemented'] }
    const schema = this.instance.schema;
    const accessToken = this.instance.access.sign(tokenPayload);
    const refreshToken = this.instance.refresh.sign(tokenPayload);
    // TODO store "auth" into Redis
    const auth: AuthService.Auth = {
      userId,
      // TODO know more about "auth" needs
      payload,
      ...tokenPayload,
      schema: this.instance.schema,
      accessToken: this.instance.access.sign(tokenPayload),
      refreshToken: this.instance.refresh.sign(tokenPayload),
    }
    Logger.important('AUTH', 'store "auth" into Redis not implemented yet')

    return { schema, accessToken, refreshToken }
  }

  public static async initialize () {
    // TODO connect DB
  }

}

// NOTE create server instance
AuthService.create();
export { AuthService };
export default AuthService;
