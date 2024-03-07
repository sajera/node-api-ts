// outsource dependencies

// local dependencies
import { APP_VERSION } from '../constant';
import { AuthService, Logger, Yup } from '../service';
import { Controller, API, Endpoint, Auth, URLEncoded, Json, Params, Swagger } from '../server';

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

  @Auth({ optional: true })
  @Endpoint({ path: '/test/:testId', method: Controller.POST })
  @Json({ schema: Yup.create({ test: Yup.POSITIVE.required('is mandatory') }) })
  @Params({ schema: Yup.create({ testId: Yup.INT.required('testId is mandatory') }) })
  public async test () {
    // TODO remove
    await this.response.status(200).type('json').send({
      body: this.request.body,
      query: this.request.query,
      params: this.request.params,
      session: this.request.session,
    });
  }

  public static sigInInput = Yup.create({
    password: Yup.PASSWORD.required('Password is mandatory'),
    email: Yup.EMAIL.required('Email is mandatory'),
  });

  public static sigInOutput = { schema: 'bearer', access: '<ACCESS_TOKEN>', refresh: '<REFRESH_TOKEN>' };

  // @Json({ schema: System.sigInInput })
  // @URLEncoded({ schema: System.sigInInput, force: false })
  @URLEncoded({}) // no validation - expect same schema as json
  @Json({ schema: System.sigInInput })
  @Endpoint({ path: '/sign-in', method: Controller.POST })
  @Swagger({ summary: 'Sign in to the System', tags: ['to-check'], sample: System.sigInOutput })
  public async signIn () {
    Logger.debug('SYSTEM', 'signIn query', this.request.query);
    Logger.debug('SYSTEM', 'signIn body', this.request.body);
    // TODO get user by login
    const login = this.request.body.login.kbk.jjjj;
    const password = this.request.body.password;
    const passwordHash = 'this.request.body.password';
    // TODO compare passwords
    const isMatch = await AuthService.comparePassword(password, passwordHash);
    if (!isMatch) { return this.response.status(400).type('json').send('Invalid credentials'); }
    // NOTE find existing user auth or create new one
    const auth = await AuthService.createAuth(1, { to: 'think about' });
    // TODO swagger response schema
    await this.response.status(200).type('json').send({ schema: auth.schema, refresh: auth.refresh, access: auth.access });
  }

  @Auth({})
  @Endpoint({ path: '/sign-out' })
  public async signOut () {
    // TODO kill session and authorization tokens
    await (new Promise(resolve => {

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
