// outsource dependencies

// local dependencies
import { AuthService } from '../service';
import { APP_VERSION } from '../constant';
import { Controller, API, Endpoint, Auth, URLEncoded, JSON, Swagger } from '../server';


/**
 * system endpoints which not belong to any controllers and mostly unique
 */
@API({ path: '/system' })
export default class System extends Controller {

  @Auth({})
  @Endpoint({ path: '/self' })
  @Swagger({ summary: 'Get self information' })
  public async getSelf () {
    // NOTE very simple solution to take logged user using decorator "WithSelf"
    await this.response.status(200).type('json').send({
      test: 'this.self'
    });
  }

  @URLEncoded({})
  @Endpoint({ path: '/sign-up', method: Controller.POST })
  public async signUp () {
    // TODO implement user creation


    await this.response.status(200).type('json').send({
      body: this.request.body,

    });
  }

  @JSON({})
  @Auth({ optional: false })
  @Endpoint({ path: '/test', method: Controller.POST })
  public async test () {
    // TODO remove
    await this.response.status(200).type('json').send({
      body: this.request.body,
      session: this.request.session,
    });
  }

  // TODO validate schema
  @JSON({})
  @Endpoint({ path: '/sign-in', method: Controller.POST })
  public async signIn () {
    // TODO get user by login
    const login = this.request.body.login
    const password = this.request.body.password
    const passwordHash = 'this.request.body.password'
    // TODO compare passwords
    const isMatch = await AuthService.comparePassword(password, passwordHash)
    if (!isMatch) { return this.response.status(400).type('json').send('Invalid credentials'); }
    // NOTE find existing user auth or create new one
    const auth = await AuthService.createAuth(1, { to: 'think about' });
    // TODO swagger response schema
    await this.response.status(200).type('json').send({  schema: auth.schema, refresh: auth.refresh, access: auth.access });
  }

  @Auth({})
  @Endpoint({ path: '/sign-out' })
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
