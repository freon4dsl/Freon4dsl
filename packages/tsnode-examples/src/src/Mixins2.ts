// Import extended classes from you own extension file
import GeneratedClass from "./Extension";

// This needs tobe doen once at startup to add all extension methods to the
// original classes. Probably make this prt of configuration?
require("./ActivateExtensions");

// Now you can create an object and use the extansion methods
const aap = new GeneratedClass();

// If newMethod does not exist (TS compiler error), try this:
// (aap as any)["newMethod"]();
aap.newMethod();
