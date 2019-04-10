
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import { ANNOTATION_TYPE } from './constant';
import {
    ControllerAnnotation,
    EndpointAnnotation,
    SwaggerAnnotation,
    Annotation,
    Endpoint
} from './interfaces';

/**
 * Define correct meta data for API endpoints
 */
export function APIEndpoint (value: EndpointAnnotation) {
    return Reflect.metadata(ANNOTATION_TYPE.ENDPOINT, value);
}
/**
 * Define addition data for swagger endpoints
 */
export function Swagger (value: SwaggerAnnotation) {
    return Reflect.metadata(ANNOTATION_TYPE.SWAGGER, value);
}

/**
 * Wrap the original controller definition with a function
 * that will first save relevant annotation
 */
export function APIController (options: ControllerAnnotation) {
    return (Ctrl: any) => {
        const annotation: Annotation = { name: Ctrl.name, ...options, endpoints: [] };
        // NOTE take data from annotations
        const target = Ctrl.prototype;
        for ( const name of Object.keys(target) ) {
            if ( !Reflect.hasMetadata(ANNOTATION_TYPE.ENDPOINT, target, name) ) { continue; }
            const endpointAnnotation: EndpointAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.ENDPOINT, target, name);
            const swaggerAnnotation: SwaggerAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.SWAGGER, target, name);
            const endpoint: Endpoint = {
                action: name,
                ...swaggerAnnotation,
                ...endpointAnnotation,
            };
            annotation.endpoints.push(endpoint);
            // console.log('Ctrl.prototype', name
            //     , '\nswagger: ', endpointAnnotation
            //     , '\nswagger: ', swaggerAnnotation
            // );
        }
        // NOTE store data which was grabbed from annotations
        Ctrl.annotation = annotation;
        return Ctrl;
    };
}
