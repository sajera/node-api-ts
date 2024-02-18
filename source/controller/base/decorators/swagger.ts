
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import { ANNOTATION_TYPE } from '../constant';
import { SwaggerAnnotation } from '../interfaces';

/**
 * Define addition data for swagger endpoints
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller {
 *     @Swagger({ ... })
 *     @APIEndpoint({method: API_METHOD.GET, path: '/express/:path'})
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export default function (value: SwaggerAnnotation) {
  return Reflect.metadata(ANNOTATION_TYPE.SWAGGER, value);
}
