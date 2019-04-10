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
    allowHead?: boolean;
    allowOption?: boolean;
}
/**
 * Endpoint annotation restriction
 */
export interface Endpoint extends EndpointAnnotation {
    action: string;
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
