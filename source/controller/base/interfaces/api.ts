// outsource dependencies

// local dependencies
import { API_METHOD } from '../constant';
import { SwaggerEndpoint } from './swagger';
import { AuthEndpoint } from './auth';

/**
 * Endpoint annotation restriction
 */
export interface EndpointAnnotation {
    path: string;
    method: API_METHOD;
}
/**
 * Endpoint annotation restriction
 */
export interface Endpoint extends EndpointAnnotation {
    action: string;
    // NOTE without final implementation - define only idea
    swagger?: SwaggerEndpoint;
    auth?: AuthEndpoint;
    any?: any;
}
/**
 * Controller annotation restriction
 */
export interface ControllerAnnotation {
    path: string;
}
/**
 * Controller annotation restriction
 */
export interface Annotation extends ControllerAnnotation {
    name: string;
    endpoints: Endpoint[];
}
