// outsource dependencies
import * as bcrypt from 'bcryptjs';
import { createHmac } from 'node:crypto';
// local dependencies
import { Logger } from './logger';
import { Redis } from '../database';
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
    refresh: string;
    access: string;
    schema: string;
    userId: string|number;
    // NOTE allow to pass some-thing
    payload?: unknown
  }
}

class AuthService {
  private readonly schema = 'bearer';

  private readonly schemaReplacer = /^Bearer /i;

  private readonly access = JwtToken.create<AuthService.AccessTokenPayload>({ expiresIn: '1m' });

  private readonly refresh = JwtToken.create<AuthService.RefreshTokenPayload>({ expiresIn: '7d' });

  private constructor () {
    Logger.log('AUTH', 'service TODO');
  }

  /**
   * create session ID by encrypt user ID to avoid compromising
   * NOTE by changing the salt we may invalidate all current session
   */
  private static sid (id: string|number): string {
    // NOTE mandatory to use predefined salt on order to define relation session with user
    const hmac = createHmac('sha256', SID_SECRET || 'sid');
    return hmac.update(String(id)).digest('hex');
  }

  // NOTE is singleton
  private static instance: AuthService;

  public static create () { this.instance = new AuthService(); }


  /**
   * TODO
   * generate password hash to avoid passing it into DB or to know what it is
   */
  public static async encryptPassword (password: string): Promise<unknown> {
    // FIXME should we use predefined salt ?
    const saltOrHashRounds = PWD_SALT || PWD_HASH || 10;
    // FIXME how much rounds we may allow to generate random hash
    // const salt = await bcrypt.genSalt(PWD_HASH);
    return await bcrypt.hash(password, saltOrHashRounds);
  }

  /**
   * ability to compare password with hash to know they equal
   */
  public static comparePassword (password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  /**
   * lightweight verification of token - check sign and expiration
   * @param header
   */
  public static verifyAuthAccess (header: string): AuthService.AccessTokenPayload {
    // NOTE just to explain the error is expected
    if (!header) { throw new Error('Authentication missing'); }
    const token = header.replace(this.instance.schemaReplacer, '');
    return this.instance.access.verify(token);
  }

  /**
   * create pseudo-session - allow to pass there some payload
   * @param userId
   * @param payload
   */
  public static async createAuth (userId: string|number, payload) {
    const sid = this.sid(userId);
    const cached = await this.getStoredAuth(userId, sid);
    // NOTE return existing auth
    if (cached) { return cached; }
    // NOTE create new auth
    const tokenPayload = { sid, name: 'not in use', roles: ['will', 'be', 'implemented'] };
    const schema = this.instance.schema;
    const access = this.instance.access.sign(tokenPayload);
    const refresh = this.instance.refresh.sign(tokenPayload);
    const auth = { userId, payload, ...tokenPayload, schema, access, refresh };
    // NOTE store "auth" into Redis
    return await this.storeAuth(sid, auth);
  }

  private static async storeAuth (sid: string, auth: AuthService.Auth): Promise<AuthService.Auth> {
    const stringAuth = JSON.stringify(auth);
    await Redis.set(sid, stringAuth);
    return auth;
  }

  public static async getStoredAuth (userId: string|number|null, sid: string = null): Promise<AuthService.Auth|null> {
    !sid && (sid = this.sid(userId));
    const cached = await Redis.get(sid);
    return !cached ? null : JSON.parse(cached);
  }

  public static invalidateStoredAuth (userId: string|number|null, sid: string = null): Promise<number> {
    !sid && (sid = this.sid(userId));
    return Redis.del(sid);
  }

}

// NOTE create servis instance
AuthService.create();
export { AuthService };
export default AuthService;
