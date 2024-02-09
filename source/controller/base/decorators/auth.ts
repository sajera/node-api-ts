
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import Controller from '../controller';
import { ANNOTATION_TYPE } from '../constant';
import { AuthAnnotation } from '../interfaces';

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
             * in case we use `reflect-metadata` as target we got not the instance of Controller but `Controller` itself
             * only one way to get current request instance use `this` which will setup from compiler using `apply`
             */
            value: async function () {
                // NOTE care about status of response
                if (this.response.headersSent) { return; }
                // NOTE delegate authorization flow to the controller
                await Controller.checkAuthorizationFlow(this, options);
                // NOTE care about status of response
                if (this.response.headersSent) { return; }
                // NOTE continue executing endpoint
                await descriptor.value.call(this);
            }
        };
    };
}
