
// outsource dependencies
import 'reflect-metadata';

/**
 * Intercept action and execute try to find authorization check
 * on absent mark `authorized` call authorization check continue only on success
 * on absent object `self` call try to get data which belong to current logged user only on success
 * try to execute checking user permission
 * on action fail send access denied error
 *
 * @example
 * export default class My extends Controller {
 *     @WithPermission({})
 *     @My.Endpoint({action: 'some', method: METHOD.GET, path: '/some/express/:path'})
 *     public async some (request: Request, response: Response) { ... }
 * }
 * @decorator
 */
export default function (options: any) {
    // NOTE store options within encapsulation
    return (target: any, property: string, descriptor: PropertyDescriptor) => {
        // NOTE annotate method as with auth
        Reflect.defineMetadata('test', options, target, property);
        console.log('Reflect.defineMetadata("test", options, target, property);', options, target, property);
        return {
            value: async function () {
                console.log('this.request.originalUrl', this.request.originalUrl);
                // console.log('target', target);
                // console.log('descriptor', descriptor);
                // // NOTE care about status of response
                // if ( response.headersSent ) { return; }
                // // NOTE care about previous check
                // if ( !target.authorized ) {
                //     // TODO common check authorization method from Controller
                //     await target._checkAuth.call(target, request, response);
                // }
                // // NOTE care about status of response
                // if ( response.headersSent ) { return; }
                // // NOTE care about previous check
                // if ( !target.self ) {
                //     // TODO common check authorization method from Controller
                //     await target._getSelf.call(target, request, response);
                // }
                // // NOTE care about status of response
                // if ( response.headersSent ) { return; }
                // // NOTE check permission
                // await target._checkSelfPermissions.call(target, request, response);
                // // NOTE care about status of response
                if ( this.response.headersSent ) { return; }
                // // NOTE continue executing endpoint
                await descriptor.value.call(this);
            }
        };
    };
}
