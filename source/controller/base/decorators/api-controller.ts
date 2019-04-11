
// outsource dependencies
import 'reflect-metadata';

// local dependencies
import formatAnnotation from '../annotations';
import { ControllerAnnotation, Annotation } from '../interfaces';

/**
 * Wrap the original controller definition with a function
 * that will first save relevant annotation
 *
 * @example
 * /@APIController({path: '/ctrl-prefix'})
 * export default class My extends Controller { ... }
 * @decorator
 */
export default function (options: ControllerAnnotation) {
    return (Ctrl: any) => {
        const annotation: Annotation = formatAnnotation(Ctrl, options);
        // NOTE store data which was grabbed from annotations
        Ctrl.annotation = annotation;
        return Ctrl;
    };
}
