import { IGeneratedClassExtensions } from "./GeneratedInterface";
import { GeneratedClassExtensions } from "./CustomClass"

export class GeneratedClass {
    prop: string;
    method(): void {}

    // extend current class
    extensions: IGeneratedClassExtensions;

    constructor() {
        this.extensions = new GeneratedClassExtensions(this);
    }
}

