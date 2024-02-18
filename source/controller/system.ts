
// outsource dependencies

// local dependencies
import { APP_VERSION } from '../constant';
import { APIController, APIEndpoint, API_METHOD, BaseController, Swagger, Auth } from './base';

/**
 * system endpoints which not belong to any controllers and mostly unique
 */
@APIController({ path: '/system' })
export default class System extends BaseController {

  /**
   * implement user self
   */
  @Auth({ self: true })
  @Swagger({ summary: 'Get self information' })
  @APIEndpoint({ path: '/self', method: API_METHOD.GET })
  public async getSelf () {
    // NOTE very simple solution to take logged user using decorator "WithSelf"
    await this.response.status(200).type('json').send({
      test: this.self
    });
  }

  /**
   * implement user sign up
   */
  @APIEndpoint({ path: '/sign-up', method: API_METHOD.POST })
  public async signUp () {
    // TODO implement user creation


    await this.response.status(200).type('json').send({
      body: this.request.body,

    });
  }

  /**
   * implement user sign in
   */
  @APIEndpoint({ path: '/sign-in', method: API_METHOD.POST })
  public async signIn () {
    // TODO implement authorization flow
    // NOTE currently fake authorization token
    await this.response.status(200).type('json').send({
      access_token: 'my_fake_authorization_token',
      refresh_token: '',
    });
  }

  /**
   * implement user sign out
   */
  @APIEndpoint({ path: '/sign-out', method: API_METHOD.GET })
  public async signOut () {
    // TODO kill session and authorization tokens
    await (new Promise((resolve, reject) => {

      // emulation ... some code

      // NOTE all done
      resolve({});
    }));
    // NOTE in any case 200: "ok"
    await this.response.status(200).type('json').send({});
  }

  /**
   * provide public system info
   */
  @APIEndpoint({ path: '/info', method: API_METHOD.GET })
  public async information () {
    await this.response.status(200).type('json').send({
      base: false,
      health: 'UP',
      auth: 'Authorization',
      version: APP_VERSION,
    });
  }

}
