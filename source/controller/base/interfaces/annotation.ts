// outsource dependencies

// local dependencies
import { API_METHOD } from '../constant';

/**
 * Swagger addition data annotation restriction
 */
export interface SwaggerAnnotation {
    any?: any;
}
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
    swagger?: any;
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
