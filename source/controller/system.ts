// outsource dependencies

// local dependencies
import { APP_VERSION } from '../constant';
import { AuthService, Logger, Yup } from '../service';
import { Controller, API, Endpoint, Exception, Auth, URLEncoded, Json, Params, Swagger } from '../server';

import { User } from '../model';

/**
 * system endpoints which not belong to any controllers and mostly unique
 */
@API({ path: '/system' })
export default class System extends Controller {

  @Auth({})
  @Endpoint({ path: '/self' })
  @Swagger({ summary: 'Get self information' })
  public async getSelf () {
    Logger.debug('SYSTEM', 'getSelf', this.request.auth);
    const user = await User.findById(this.request.auth.userId).exec();
    // NOTE very simple solution to take logged user using decorator "WithSelf"
    await this.response.status(200).type('json').send({
      login: user.login,
      email: user.email,
      name: user.name,
    });
  }

  public static sigUpInput = Yup.create({
    password: Yup.PASSWORD.required(),
    email: Yup.EMAIL.required(),
    name: Yup.NAME.required(),
  });

  @Json({ schema: System.sigUpInput })
  @Endpoint({ path: '/sign-up', method: Controller.POST })
  @Swagger({ summary: 'Create the user', sample: { access: '<ACCESS_TOKEN>', refresh: '<REFRESH_TOKEN>' } })
  public async signUp () {
    // NOTE normalized "login" value to exclude abnormal parts
    const { email: login } = AuthService.parseEmail(this.request.body.email);
    // NOTE check login to make sure it is new
    const exist = await User.findOne({ login }).exec();
    if (exist) { throw new Exception('LOGIN_EXIST'); }
    const password = await AuthService.encryptPassword(this.request.body.password);
    // NOTE create a user
    const user = new User({
      login,
      password,
      name: this.request.body.name,
      // NOTE save email as is ¯\_(ツ)_/¯
      email: this.request.body.email,
    });
    await user.save();
    // NOTE find existing user auth or create new one
    const auth = await AuthService.createAuth(user.id, { to: 'think about session payload' });
    await this.response.status(200).type('json').send({
      refresh: auth.refresh,
      access: auth.access,
    });

  }

  @URLEncoded({}) // no validation - expect same schema as json
  @Endpoint({ path: '/sign-in', method: Controller.POST })
  @Json({ schema: Yup.create({ password: Yup.PASSWORD.required(), email: Yup.EMAIL.required() }) })
  @Swagger({ summary: 'Sign in to the System', sample: { access: '<ACCESS_TOKEN>', refresh: '<REFRESH_TOKEN>' } })
  public async signIn () {
    // NOTE normalized "login" value to exclude abnormal parts
    const { email: login } = AuthService.parseEmail(this.request.body.email);
    // NOTE check login to make sure it is new
    const user = await User.findOne({ login }).exec();
    if (!user) { throw new Exception('ACCESS_DENIED'); }
    const isMatch = await AuthService.comparePassword(this.request.body.password, user.password);
    if (!isMatch) { throw new Exception('ACCESS_DENIED'); }
    // NOTE find existing user auth or create new one
    const auth = await AuthService.createAuth(user.id, { to: 'think about session payload' });
    await this.response.status(200).type('json').send({
      refresh: auth.refresh,
      access: auth.access,
    });
  }

  @Auth({ optional: true })
  @Endpoint({ path: '/sign-out' })
  @Swagger({ summary: 'Invalidate all tokens', sample: 'OK' })
  public async signOut () {
    // Logger.debug('SYSTEM', 'signOut', this.request.auth);
    if (this.request.auth?.sid) {
      await AuthService.invalidateStoredAuth(null, this.request.auth?.sid);
    }
    await this.response.status(200).type('json').send('"OK"');
  }

  @Endpoint({ path: '/info', method: Controller.GET })
  public async information () {
    await this.response.status(200).type('json').send({
      base: false,
      health: 'UP',
      token: 'Bearer ',
      auth: 'Authorization',
      version: APP_VERSION,
    });
  }


  // TODO remove
  @Auth({ optional: true })
  @Endpoint({ path: '/test/:testId', method: Controller.POST })
  @Json({ force: true, schema: Yup.create({ test: Yup.POSITIVE.required('is mandatory') }) })
  @URLEncoded({}) // same as json - let it validate all requests ¯\_(ツ)_/¯
  @Params({ schema: Yup.create({ testId: Yup.INT.required('testId is mandatory') }) })
  public async test () {
    await this.response.status(200).type('json').send({
      body: this.request.body,
      auth: this.request.auth,
      query: this.request.query,
      params: this.request.params,
      session: this.request.session,
    });
  }
}
