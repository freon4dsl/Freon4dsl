import { ExtensionClass } from "./Extension";
import { extension } from "./ExtensionLib";
import { GeneratedClass } from "./GeneratedClass";

// NB The following should be done once.
extension(ExtensionClass, GeneratedClass);

const a = new GeneratedClass();

console.log("X: " + a.methodX());
console.log("Y: " + a.methodY());
console.log("New: " + a.newMethod());
