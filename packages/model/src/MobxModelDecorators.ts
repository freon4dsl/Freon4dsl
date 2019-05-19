import { IArrayWillChange, IArrayWillSplice, observable } from "mobx";
import { ObservableValue } from "mobx/lib/types/observablevalue";
import "reflect-metadata";

import { DecoratedModelElement } from "./DecoratedModelElement";
import { ModelInfo } from "./ModelInfo";

export const MODEL_PREFIX = "_PI_";
export const MODEL_PREFIX_LENGTH = MODEL_PREFIX.length;
export const MODEL_CONTAINER = MODEL_PREFIX + "Container";
export const MODEL_NAME = MODEL_PREFIX + "Name";

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target is the prototype
 * @param {string | symbol} propertyKey
 */
export function observablereference(target: DecoratedModelElement, propertyKey: string | symbol) {
    console.log("000000000000000000000000000000000000000000000000000000000000000000");
    ModelInfo.references.add(target.constructor.name, propertyKey.toString());
}

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target is the prototype
 * @param {string | symbol} propertyKey
 */
export function observablelistreference(target: DecoratedModelElement, propertyKey: string | symbol) {
    ModelInfo.listReferences.add(target.constructor.name, propertyKey.toString());
}

export function model1() {
    return (constructor: new (...args: any[]) => any) => {
        return constructor;
    };
}

interface ctor {
    new (...args: any[]): any;
    run: any;
}
export function model2(target: Function) {
    ModelInfo.addClass(target.name, target);
    // return (constructor: ctor ) => {
    //     return constructor;
    // };
    return function(target: any): any {
        // save a reference to the original constructor
        var original = target;

        // the new constructor behaviour
        var f: any = function(...args) {
            console.log("ClassWrapper: before class constructor", original.name);
            let instance = original.apply(this, args);
            console.log("ClassWrapper: after class constructor", original.name);
            return instance;
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    };
}
export function model(target: Function) {
    ModelInfo.addClass(target.name, target);
}
/**
 *
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 */
export function observablepart(target: DecoratedModelElement, propertyKey: string | symbol) {
    ModelInfo.parts.add(target.constructor.name, propertyKey.toString());
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        const storedObserver = this[privatePropertyKey] as ObservableValue<DecoratedModelElement>;
        let result: any = storedObserver ? storedObserver.get() : undefined;
        if (result === undefined) {
            result = null;
            this[privatePropertyKey] = observable.box(result);
        }
        return result;
    };

    const setter = function(this: any, val: DecoratedModelElement) {
        let storedObserver = this[privatePropertyKey] as ObservableValue<DecoratedModelElement>;
        const storedValue = storedObserver ? storedObserver.get() : null;
        // Clean container of current part
        if (storedValue) {
            storedValue.container = null;
            storedValue.propertyName = "";
            storedValue.propertyIndex = undefined;
        }
        if (storedObserver) {
            storedObserver.set(val);
        } else {
            this[privatePropertyKey] = observable.box(val);
            storedObserver = this[privatePropertyKey];
        }
        if (val !== null && val !== undefined) {
            if (val.container !== undefined && val.container !== null) {
                if (val.propertyIndex !== undefined) {
                    // Clean new value from its containing list
                    (val.container as any)[val.propertyName].splice(val.propertyIndex, 1);
                } else {
                    // Clean new value from its container
                    (val.container as any)[MODEL_PREFIX + val.propertyName] = null;
                }
            }
            // Set container
            val.container = this;
            val.propertyName = propertyKey.toString();
            val.propertyIndex = undefined;
        }
    };

    // tslint:disable no-unused-expression
    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        configurable: true
    });
}

export function observablelistpart(target: Object, propertyKey: string | symbol) {
    ModelInfo.listparts.add(target.constructor.name, propertyKey.toString());
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        let result = this[privatePropertyKey];
        if (result === undefined) {
            const array = observable.shallowArray([]);
            result = array;
            this[privatePropertyKey] = result;
            (array as any)[MODEL_CONTAINER] = this;
            (array as any)[MODEL_NAME] = propertyKey.toString();
            array.intercept(change => willChange(change));
            // intercept(array,
            // (change: IArrayWillChange<MobxModelElement> | IArrayWillSplice<MobxModelElement>) => willChange(change) as any);
        }
        return result;
    };

    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter
    });
}

/**
 * Function called when an array element is changed, will ensure
 * that the old element is removed and iots container reference is cleared.
 * The new element will have its container reference set correctly.
 * @param change
 */
function willChange(
    change: IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement>
): IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement> | null {
    switch (change.type) {
        case "update":
            if (change.newValue === change.object[change.index]) {
                // console.log("no change");
            } else {
                // new object at index
                const value = change.newValue;
                if (value) {
                    if (value.container) {
                        // cleanup old container reference of new value
                        if (value.propertyIndex !== undefined) {
                            (value.container as any)[value.propertyName][value.propertyIndex] = null;
                        } else {
                            (value.container as any)[value.propertyName] = null;
                        }
                    }
                    change.newValue.container = change.object[change.index].container;
                    change.newValue.propertyName = change.object[change.index].propertyName;
                    change.newValue.propertyIndex = change.object[change.index].propertyIndex;
                }

                // Cleanup container reference of old value
                change.object[change.index].container = null;
                change.object[change.index].propertyName = "";
                change.object[change.index].propertyIndex = undefined;
            }
            break;
        case "splice":
            let index: number = change.index;
            const removedCount: number = change.removedCount;
            const added: DecoratedModelElement[] = change.added;
            const addedCount = added.length;
            const xxx = change.object;
            for (const i in added) {
                added[i].container = (change.object as any)[MODEL_CONTAINER];
                added[i].propertyName = (change.object as any)[MODEL_NAME];
                added[i].propertyIndex = index + Number(i);
            }
            for (let num = 0; num < removedCount; num++) {
                let rr = index + num;
                if (!(typeof index === "number")) {
                    console.trace("=====================================");
                    console.log("MOBX ARRAY change Index type " + typeof index);
                    // TODO (index as any) because of TS2407:  The right-hand side of a 'for...in' statement must be
                    //       of type 'any', an object type or a type parameter, but here has type 'never'.
                    for (const pp in index as any) {
                        console.log("        key " + pp + " type " + typeof index[pp]);
                    }
                    index = index[0];
                }
                rr = num + index;
                change.object[rr].container = null;
                change.object[rr].propertyName = "";
                change.object[rr].propertyIndex = undefined;
            }
            // Update all other indices
            for (let above = index; above < change.object.length; above++) {
                const aboveElement = change.object[above];
                if (aboveElement.propertyIndex !== undefined) {
                    aboveElement.propertyIndex += addedCount - removedCount;
                }
            }
            break;
    }
    return change;
}
