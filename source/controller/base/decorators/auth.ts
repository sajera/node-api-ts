
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import { ANNOTATION_TYPE } from '../constant';
import { SwaggerAnnotation, AuthAnnotation } from '../interfaces';

/**
 * Define addition data for swagger endpoints
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Auth({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export function q (value: SwaggerAnnotation) {
    return Reflect.metadata(ANNOTATION_TYPE.SWAGGER, value);
}


/**
 * Intercept action implement authorization flows
 * Also define addition annotation
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Auth({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export default function (options: AuthAnnotation) {
    // NOTE store options within encapsulation
    return (target: any, property: string, descriptor: PropertyDescriptor) => {
        // NOTE annotate method as with auth
        Reflect.defineMetadata(ANNOTATION_TYPE.AUTH, options, target, property);
        return {
            /**
             * important !!! DO NOT USE ARROW FUNCTION !!!
             * in case we use `reflect-metadata` as target we get not the instance but `Controller`
             * only one way to get current request instance use `this` which will setup from compiler using `apply`
             */
            value: async function () {
                // NOTE care about status of response
                if ( this.response.headersSent ) { return; }
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

                // NOTE care about status of response
                if ( this.response.headersSent ) { return; }
                // NOTE continue executing endpoint
                await descriptor.value.call(this);
            }
        };
    };
}
