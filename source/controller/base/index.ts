
// base controller to extend
import Controller from './controller';

// common implementation parts
import { METHOD } from './const';
import { RoutOptions, SelfOptions, endpointFn, middlewareFn, errorMiddlewareFn  } from './interface';

// specific common implementation parts
import { WithAuth, WithSelf } from './auth';


// NOTE make aliases to comfortable usage
export {
    Controller, // abstract base controller
    // constants
    METHOD,

    // interfaces
    RoutOptions,
    SelfOptions,
    endpointFn,
    middlewareFn,
    errorMiddlewareFn,

    // specific for project
    WithAuth,
    WithSelf,

    
};

export default Controller;
