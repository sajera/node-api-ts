// outsource dependencies

// local dependencies
import { APP_VERSION } from '../constant';
import { Controller, API, Endpoint, Auth, URLEncoded, JSON, Swagger } from '../server'


/**
 * system endpoints which not belong to any controllers and mostly unique
 */
@API({ path: '/system' })
export default class System extends Controller {

  @Auth({ self: true })
  @Endpoint({ path: '/self' })
  @Swagger({ summary: 'Get self information' })
  public async getSelf () {
    // NOTE very simple solution to take logged user using decorator "WithSelf"
    await this.response.status(200).type('json').send({
      test: 'this.self'
    });
  }

  @URLEncoded({ any: 1 })
  @Endpoint({ path: '/sign-up', method: Controller.POST })
  public async signUp () {
    // TODO implement user creation


    await this.response.status(200).type('json').send({
      body: this.request.body,

    });
  }

  @JSON({ any: 2 })
  @Endpoint({ path: '/test', method: Controller.POST })
  public async test () {
    // TODO remove
    await this.response.status(200).type('json').send({
      body: this.request.body,
      session: this.request.session,
    });
  }

  @Endpoint({ path: '/sign-in', method: Controller.POST })
  public async signIn () {
    // TODO implement authorization flow
    // NOTE currently fake authorization token
    await this.response.status(200).type('json').send({
      access_token: 'my_fake_authorization_token',
      refresh_token: '',
    });
  }

  @Endpoint({ path: '/sign-out', method: Controller.GET })
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
  @Endpoint({ path: '/info', method: Controller.GET })
  public async information () {
    await this.response.status(200).type('json').send({
      base: false,
      health: 'UP',
      auth: 'Authorization',
      version: APP_VERSION,
    });
  }

}
