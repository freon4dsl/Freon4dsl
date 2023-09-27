

function find<T>(n: string, prop:string, method: string): T {
    for (const lang of this[prop]) {
        const result = lang[method]();
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
function find2<T, L>(n: string, list:L[], method: string): T {
    for (const lang of list) {
        const result = lang[method]() as T;
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
function findSimple<T, L>(list:L[], method: (l: L) => T): T {
    for (const lang of list) {
        const result = method(lang);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
function findSimple2<T, L>(list:L[], method: () => T): T {
    for (const lang of list) {
        const func: () => T = method.bind(lang);
        const result = func();
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
function findComplex<T, L>(par: string, list:L[], method: (l: L, s: string) => T): T {
    for (const lang of list) {
        const result = method(lang, par);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}

class Child {
    subs: Map<string, Sub> = new Map<string, Sub>();

    constructor(k: string) {
        this.subs.set(k + "1", new Sub("one"));
        this.subs.set(k + "2", new Sub("two"));
        this.subs.set(k + "3", new Sub("three"));
        this.subs.set(k + "4", new Sub("four"));
    }
    findSub(n: string): Sub {
        return this.subs.get(n);
    }
    
}

class Sub {
    key: string;

    constructor(k: string) {
        this.key = k;
    }
}

class Generic {
    children: Child[] = [];
    constructor() {
        this.children.push(new Child("asub_"));
        this.children.push(new Child("another_sub_"));
    }

    findSub(n: string): Sub {
        // return findComplex<Sub, Child>(n, this.children, (l: Child, s: string) => { return l.findSub(s)});
        return this.lfindComplex<Sub>(n, (l: Child, s: string) => { return l.findSub(s)});
        return this.lfindComplex2<Sub>(n,"findSub");
    }

    lfindComplex<T>(par: string, method: (l: Child, s: string) => T): T {
        for (const lang of this.children) {
            const result = method(lang, par);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }
    lfindComplex2<T>(par: string, method: string): T {
            for (const lang of this.children) {
                // check whether `method` is a function, no way to test the number of parameters.
                if (typeof lang[method] !== "function") {
                    console.error(method + " is not a function");
                    return undefined;
                }
                const result = lang[method](par);
                if (result !== undefined) {
                    return result;
                }
            }
            return undefined;
    }

}

const g = new Generic();

console.log("Find asub_1: " + g.findSub("asub_1")?.key);
console.log("Find another_sub_3: " + g.findSub("another_sub_3")?.key);
console.log("Find asub_6: " + g.findSub("asub_6")?.key);
