
// base controller to extend
import Controller from './controller';

// common implementation parts
import { METHOD } from './const';
import { RoutOptions, PermissionOptions, endpointFn, middlewareFn, errorMiddlewareFn  } from './interface';

// specific common implementation parts
import is, { Validate } from './validate';
import { WithAuth, WithSelf, WithPermission } from './auth';

// NOTE make aliases to comfortable usage
export {
    Controller, // abstract base controller
    // constants
    METHOD,

    // interfaces
    RoutOptions,
    PermissionOptions,
    endpointFn,
    middlewareFn,
    errorMiddlewareFn,

    // specific for project
    WithAuth,
    WithSelf,
    WithPermission,
    Validate,

    // validation helper
    is,
};

export default Controller;
