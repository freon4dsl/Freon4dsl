import { IGeneratedClassExtensions } from "./GeneratedInterface";
import { GeneratedClass } from "./GeneratedClass";

export class GeneratedClassExtensions implements IGeneratedClassExtensions {
    self: GeneratedClass;

    constructor(original: GeneratedClass) {
        this.self = original;
    }

    customProp: string;
    customMethod() {}
}
//
// export default GeneratedClass;
