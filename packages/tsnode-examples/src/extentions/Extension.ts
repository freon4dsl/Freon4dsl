import { GeneratedClass} from "./GeneratedClass";

// TS typing
declare module "./GeneratedClass" {
    export interface GeneratedClass {
        newMethod(): void;
    }
}

export class ExtensionClass extends GeneratedClass {
    public newMethod() {
        return "new method " + this.name;
    }
}

export default GeneratedClass;

// extension(ExtensionClass, GeneratedClass);

// namespace GeneratedClass {
//     export interface GeneratedClass {
//         newMethod(): void;
//     }
// }
//
// export class ExtensionClass extends GeneratedClass {
//     public newMethod() {
//         console.log("X " + this.name);
//     }
// }
//
// export type Constructor22 = new (...args: any[]) => {};
//
// export function extension(extension: Constructor22, original: Constructor22) {
//     const extensionPrototype = extension.prototype;
//     const originalPrototype = original.prototype
//     for (const property of Object.getOwnPropertyNames(extensionPrototype)) {
//         if (property !== "constructor") {
//             console.log("Extending " + originalPrototype.constructor.name + " with property " + property);
//             originalPrototype[property] = extensionPrototype[property];
//         }
//     }
// }
//
// extension(ExtensionClass, GeneratedClass);

