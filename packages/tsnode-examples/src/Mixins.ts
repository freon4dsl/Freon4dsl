// type Constructor<T = {}> = new (...args: any[]) => T;

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            let descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
            Object.defineProperty(derivedCtor.prototype, name, <PropertyDescriptor & ThisType<any>>descriptor);
        });
    });
}

interface MyInterface {
    name: string;
}
class MyClass {
    name: string = "MyClass";

    constructor() {
    }
}

interface ICallable {
    call(): void;
}
interface MyClass extends ICallable {}

class Callable implements ICallable {
    call() {
        console.log("Call!")
    }
}
abstract class Activable {
    active: boolean = false
    activate() {
        this.active = true
        console.log("Activating…")
    }
    deactive() {
        this.active = false
        console.log("Deactivating…")
    }
}

// interface MyClass extends Callable, Activable {}

applyMixins(MyClass, [Callable, Activable])
let o = new MyClass()
o.call()
// o.activate()
