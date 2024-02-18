
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import { ANNOTATION_TYPE } from './constant';
import {
  ControllerAnnotation,
  EndpointAnnotation,
  SwaggerAnnotation,
  AuthAnnotation,
  Annotation,
  Endpoint
} from './interfaces';

/**
 * Take relevant annotation
 */
export default function (Ctrl: any, rootOptions: ControllerAnnotation): Annotation {
  const target = Ctrl.prototype;
  const annotation: Annotation = { ...rootOptions, name: Ctrl.name, endpoints: [] };
  const allNames: string[] = Object.keys(target);
  const endpointNames: string[] = [];
  // NOTE take only annotated as endpoint
  for (const name of allNames) {
    if (Reflect.hasMetadata(ANNOTATION_TYPE.ENDPOINT, target, name)) {
      endpointNames.push(name);
    }
  }
  // NOTE grab all relevant annotation of each endpoint
  for (const name of endpointNames) {
    // NOTE endpoint root information
    const { path, method }: EndpointAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.ENDPOINT, target, name);
    const endpoint: Endpoint = { action: name, path, method };
    // NOTE (optionally) endpoint Swagger information
    const swaggerAnnotation: SwaggerAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.SWAGGER, target, name);
    if (swaggerAnnotation) {
      endpoint.swagger = swaggerAnnotation;
    }
    // NOTE (optionally) endpoint Authorization information
    const authAnnotation: AuthAnnotation = Reflect.getMetadata(ANNOTATION_TYPE.AUTH, target, name);
    if (authAnnotation) {
      endpoint.auth = authAnnotation;
    }
    annotation.endpoints.push(endpoint);
  }
  return annotation;
}
