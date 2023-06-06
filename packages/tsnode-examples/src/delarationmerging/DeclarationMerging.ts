export class GeneratedClass {
    name: string = "default A name";
    constructor() {
    }
    methodX(): void { };
    methodY(): void { };
}


export interface GeneratedClass {
    newMethod(): void;
}

const a = new GeneratedClass();

// Option 1: ugly
// A.prototype.newMethod = function () { console.log('a ' + this.name) };

// Option 2
class ExtensionClass extends GeneratedClass {
    public newMethod() {
        console.log("X " + this.name);
    }
}

type Constructor22 = new (...args: any[]) => {};

function extension(extension: Constructor22, original: Constructor22) {
    const extensionPrototype = extension.prototype;
    const originalPrototype = original.prototype
    for(const property of Object.getOwnPropertyNames(extensionPrototype)) {
        if( property !== "constructor"){
            console.log("Extending " + originalPrototype.constructor.name + " with property " + property);
            originalPrototype[property] = extensionPrototype[property];
        }
    }
}
extension(ExtensionClass, GeneratedClass);
// A.prototype.newMethod = X.prototype.newMethod;

// console.log(JSON.stringify(X.prototype));
a.newMethod();
const x = new ExtensionClass();

function props(obj: Object) {
    var p = [];
    for (; obj != null; obj = Object.getPrototypeOf(obj)) {
        var op = Object.getOwnPropertyNames(obj);
        for (var i=0; i<op.length; i++)
            if (p.indexOf(op[i]) == -1)
                p.push(op[i]);
    }
    return p;
}
// console.log(props(a));
// console.log(props(x));

a.newMethod();
// function logAllProperties(obj: Object) {
//     if (obj == null) return; // recursive approach
//     console.log(Object.getOwnPropertyNames(obj));
//     // logAllProperties(Object.getPrototypeOf(obj));
// }
// console.log("AAAAA ")
// logAllProperties(Object.getPrototypeOf(a));
// console.log("XXXXX ")
// logAllProperties(Object.getPrototypeOf(x));

