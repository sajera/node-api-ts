// outsource dependencies
import * as express from 'express';

// local dependencies
import { Token } from './token';
import { Logger } from './logger';

class AuthService {
  private access = Token.create({ expiresIn: '1h' })
  private refresh = Token.create({ expiresIn: '1m' })

  private constructor () {
    Logger.log('AUTH', 'service TODO');
  }

  // NOTE is singleton
  private static instance: AuthService;
  public static create () { this.instance = new AuthService() }

  /**
   * token verification
   * @param token
   */
  public static checkTokenSign (token: string): boolean {

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
