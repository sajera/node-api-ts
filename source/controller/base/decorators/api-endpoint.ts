
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import { ANNOTATION_TYPE } from '../constant';
import { EndpointAnnotation } from '../interfaces';

/**
 * Define correct meta data for API endpoints
 *
 * @example
 * /@APIController({ path: '/ctrl-prefix' })
 * export default class My extends Controller {
 *     @APIEndpoint({ method: API_METHOD.GET, path: '/express/:path' })
 *     public async endpoint () { ... }
 * }
 * @decorator
 */
export default function (value: EndpointAnnotation) {
  return Reflect.metadata(ANNOTATION_TYPE.ENDPOINT, value);
}
