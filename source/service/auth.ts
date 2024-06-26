// outsource dependencies
import * as bcrypt from 'bcryptjs';
import { createHmac } from 'node:crypto';
// local dependencies
import { Redis } from './redis';
import { Logger } from './logger';
import { JwtToken } from './jwt-token';
import { PWD_SALT, PWD_ROUNDS, SID_SECRET } from '../constant';

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
// eslint-disable-next-line @typescript-eslint/no-namespace
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
class Unauthorized extends Error {
  constructor (public code = 403) {
    super('ACCESS_DENIED');
  }
}
class AuthService {
  private readonly schema = 'bearer';

  private readonly schemaReplacer = /^Bearer /i;

  private readonly access = JwtToken.create<AuthService.AccessTokenPayload>({ expiresIn: '15m' });

  private readonly refresh = JwtToken.create<AuthService.RefreshTokenPayload>({ expiresIn: '7d' });

  public static Exception = Unauthorized;

  /**
   * create session ID by encrypt user ID to avoid compromising
   * NOTE by changing the salt we may invalidate all current session
   */
  private static sid (id: string|number): string {
    // NOTE mandatory to use predefined salt in order to define relation session with user
    const hmac = createHmac('sha256', SID_SECRET || 'sid');
    return hmac.update(String(id)).digest('hex');
  }

  // NOTE is singleton
  private static instance: AuthService;

  public static create () { this.instance = new AuthService(); }

  /**
   * generate password hash to avoid passing it into DB or to know what it is
   */
  public static async encryptPassword (password: string): Promise<unknown> {
    // FIXME should we use predefined salt ?
    const saltOrHashRounds = PWD_SALT || PWD_ROUNDS || 10;
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
   * parse an email address
   */
  public static parseEmail (email: string) {
    let [login, domain] = email.toLowerCase().split(/@/);
    // NOTE remove aliases and tags
    login = login.replace(/\.|\+.*$/g, '');
    // NOTE alis of "gmail.com"
    domain = domain.replace(/googlemail.com/, 'gmail.com');
    // FIXME I am sure that is not all tricks
    return { login, domain, email: `${login}@${domain}` };
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
   * find existing or create new pseudo-session - allow to pass there some payload
   */
  public static async findOrCreateAuth (userId: string|number, payload) {
    try { // NOTE trying to find existing
      const sid = this.sid(userId);
      const auth = await this.getStoredAuth(userId, sid);
      // NOTE apply updates of payload - also will throw in case "auth" absent
      auth.payload = payload;
      this.instance.refresh.verify(auth.refresh);
      // NOTE refresh token within session still valid
      try {
        this.instance.access.verify(auth.access);
        // NOTE access token within session still valid
      } catch (error) {
        // NOTE means the "auth.access" require refreshing
        auth.access = this.instance.access.sign({ sid });
        Logger.debug('AUTH', 'findOrCreateAuth => refreshing access');
      }
      // NOTE update "auth" within Redis
      return await this.storeAuth(sid, auth);
    } catch (error) {
      // NOTE means the "auth" Interrupted/Invalidated
      return await this.createAuth(userId, payload);
    }
  }

  /**
   * create new pseudo-session - allow to pass there some payload
   */
  public static async createAuth (userId: string|number, payload) {
    const sid = this.sid(userId);
    const access = this.instance.access.sign({ sid });
    const refresh = this.instance.refresh.sign({ sid });
    const auth = { userId, payload, sid, schema: this.instance.schema, access, refresh };
    // NOTE store "auth" into Redis
    return await this.storeAuth(sid, auth);
  }

  /**
   * update access token of session using refresh token
   */
  public static async refreshAuth (refresh: string) {
    // NOTE make sure the refresh token alive and valid
    const { sid } = this.instance.refresh.verify(refresh);
    // NOTE make sure the session valid
    const auth = await this.getStoredAuth(null, sid);
    // NOTE session absent
    if (!auth) { throw new AuthService.Exception(); }
    try {
      this.instance.access.verify(auth.access);
      // NOTE access token within session still valid
      return auth;
    } catch (error) {
      // NOTE means the "auth.access" require refreshing
    }
    auth.access = this.instance.access.sign({ sid });
    // NOTE update "auth" within Redis
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

// NOTE create service instance
AuthService.create();
export { AuthService };
