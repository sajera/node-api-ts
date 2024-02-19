
// outsource dependencies

// local dependencies
import { APP_VERSION } from './constant';
import { APIController, APIEndpoint, Controller } from './server/controller'


/**
 * system endpoints which not belong to any controllers and mostly unique
 */
@APIController({ path: '/system' })
export default class System extends Controller {
  
  // @Auth({ self: true })
  // @Swagger({ summary: 'Get self information' })
  @APIEndpoint({ path: '/self', method: Controller.GET })
  public async getSelf () {
    // NOTE very simple solution to take logged user using decorator "WithSelf"
    await this.response.status(200).type('json').send({
      test: 'this.self'
    });
  }

  @APIEndpoint({ path: '/sign-up', method: Controller.POST })
  public async signUp () {
    // TODO implement user creation


    await this.response.status(200).type('json').send({
      body: this.request.body,

    });
  }

  @APIEndpoint({ path: '/sign-in', method: Controller.POST })
  public async signIn () {
    // TODO implement authorization flow
    // NOTE currently fake authorization token
    await this.response.status(200).type('json').send({
      access_token: 'my_fake_authorization_token',
      refresh_token: '',
    });
  }

  @APIEndpoint({ path: '/sign-out', method: Controller.GET })
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
  @APIEndpoint({ path: '/info', method: Controller.GET })
  public async information () {
    await this.response.status(200).type('json').send({
      base: false,
      health: 'UP',
      auth: 'Authorization',
      version: APP_VERSION,
    });
  }

}
