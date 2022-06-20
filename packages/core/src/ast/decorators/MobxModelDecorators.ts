import { IObservableValue, IArrayWillChange, IArrayWillSplice, observable, intercept, runInAction } from "mobx";
import "reflect-metadata";

import { DecoratedModelElement } from "./DecoratedModelElement";
import { PiChangeManager } from "../../change-manager";

export const MODEL_PREFIX = "_PI_";
export const MODEL_PREFIX_LENGTH = MODEL_PREFIX.length;
export const MODEL_CONTAINER = MODEL_PREFIX + "Container";
export const MODEL_NAME = MODEL_PREFIX + "Name";

export function observablePrim(target: DecoratedModelElement, propertyKey: string ) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
    const getter = function(this: any) {
        const storedObserver = this[privatePropertyKey] as IObservableValue<string | number | boolean>;
        if (!!storedObserver) {
            return storedObserver.get();
        } else {
            this[privatePropertyKey] = observable.box(null);
            return this[privatePropertyKey].get();
        }
    };

    const setter = function(this: any, newValue: string | number | boolean) {
        PiChangeManager.getInstance().setPrimitive(this, propertyKey, newValue);

        let storedObserver = this[privatePropertyKey] as IObservableValue<string | number | boolean>;

        if (!!storedObserver) {
            runInAction( () => {
                storedObserver.set(newValue);
            });
        } else {
            storedObserver = observable.box(newValue);
            this[privatePropertyKey] = storedObserver;
        }
    }
    // tslint:disable no-unused-expression
    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        configurable: true
    });
}

/**
 *
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep an owner reference.
 *
 * @param {Object} target
 * @param {string } propertyKey
 */
export function observablepart(target: DecoratedModelElement, propertyKey: string) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        const storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        if (!!storedObserver) {
            return storedObserver.get();
        } else {
            this[privatePropertyKey] = observable.box(null);
            return this[privatePropertyKey].get();
        }
    };

    const setter = function(this: any, newValue: DecoratedModelElement) {
        let storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        const storedValue = !!storedObserver ? storedObserver.get() : null;
        PiChangeManager.getInstance().setPart(this, propertyKey, newValue, storedValue);
        // Clean owner of current part
        if (!!storedValue) {
            storedValue.$$owner = null;
            storedValue.$$propertyName = "";
            storedValue.$$propertyIndex = undefined;
        }
        if (!!storedObserver) {
            runInAction( () => {
                storedObserver.set(newValue);
            });
        } else {
            this[privatePropertyKey] = observable.box(newValue);
            storedObserver = this[privatePropertyKey];
        }
        if (newValue !== null && newValue !== undefined) {
            if (newValue.$$owner !== undefined && newValue.$$owner !== null) {
                if (newValue.$$propertyIndex !== undefined) {
                    // Clean new value from its containing list
                    (newValue.$$owner as any)[newValue.$$propertyName].splice(newValue.$$propertyIndex, 1);
                } else {
                    // Clean new value from its owner
                    (newValue.$$owner as any)[MODEL_PREFIX + newValue.$$propertyName] = null;
                }
            }
            // Set owner
            newValue.$$owner = this;
            newValue.$$propertyName = propertyKey.toString();
            newValue.$$propertyIndex = undefined;
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

export function observablelistpart(target: Object, propertyKey: string ) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        let result = this[privatePropertyKey];
        if (result === undefined) {
            const array = observable.array([], { deep: false });
            result = array;
            this[privatePropertyKey] = result;
            (array as any)[MODEL_CONTAINER] = this;
            (array as any)[MODEL_NAME] = propertyKey.toString();
            // array.intercept(change => willChange(change));
            // Changed for mobx6 as follows:
            intercept(array, change => willChange(change))
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
 * The type of the index in a list might be an array instead of a single number.
 * In that case, we take the first element of the array as index.
 * @param index
 */
function checkIndexType(index: number) {
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
    return index;
}

/**
 * Function called when an array element is changed, will ensure
 * that the old element is removed and its owner reference is cleared.
 * The new element will have its owner reference set correctly.
 * @param change
 */
function willChange(
    change: IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement>
): IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement> | null {
    // console.log("willChange [" + change.type + "]");
    switch (change.type) {
        // console.log("no change");
        case "update":
            const newValue = change.newValue;
            const oldValue = change.object[change.index];
            PiChangeManager.getInstance().updateListElement(newValue, oldValue, change.index);
            if (newValue !== oldValue) {
                if (!!newValue) {
                    if (!!newValue.$$owner) {
                        // cleanup old owner reference of new value
                        if (newValue.$$propertyIndex !== undefined) {
                            (newValue.$$owner as any)[newValue.$$propertyName][newValue.$$propertyIndex] = null;
                        } else {
                            (newValue.$$owner as any)[newValue.$$propertyName] = null;
                        }
                    }
                    newValue.$$owner = oldValue.$$owner;
                    newValue.$$propertyName = oldValue.$$propertyName;
                    newValue.$$propertyIndex = oldValue.$$propertyIndex;
                }

                // Cleanup owner reference of old value
                oldValue.$$owner = null;
                oldValue.$$propertyName = "";
                oldValue.$$propertyIndex = undefined;
            }
            break;
        case "splice":
            let index: number = checkIndexType(change.index);
            const removedCount: number = change.removedCount;
            // find all elements that need to be removed
            const removed = [];
            for (let num = 0; num < removedCount; num++) {
                removed.push(change.object[index + num]);
            }
            // find all elements that need to be added
            const added: DecoratedModelElement[] = change.added;
            const addedCount = added.length;
            // find the list owner and the name of the property that holds the list
            const listOwner = (change.object as any)[MODEL_CONTAINER];
            const propertyName: string = (change.object as any)[MODEL_NAME];
            // make sure the change is propagated to listeners
            PiChangeManager.getInstance().updateList(listOwner, propertyName, index, removed, added);
            // change the owner info in the elements to be added, if any
            added.forEach((element, i) => {
                // cleanup old owner reference of new value
                if (!!element) {
                    if (!!element.$$owner) {
                        if (element.$$propertyIndex !== undefined) {
                            (element.$$owner as any)[element.$$propertyName][element.$$propertyIndex] = null;
                        } else {
                            (element.$$owner as any)[element.$$propertyName] = null;
                        }
                    }
                    // set the owner properties for inserted elements
                    element.$$owner = listOwner;
                    element.$$propertyName = propertyName;
                    element.$$propertyIndex = index + Number(i);
                }
            });
            // change the owner info in the elements to be removed, if any
            for (const rem of removed) {
                rem.$$owner = null;
                rem.$$propertyName = "";
                rem.$$propertyIndex = undefined;
            }
            // update all other indices
            for (let above = index; above < change.object.length; above++) {
                const aboveElement = change.object[above];
                if (aboveElement.$$propertyIndex !== undefined) {
                    aboveElement.$$propertyIndex += addedCount - removedCount;
                }
            }
            break;
    }
    return change;
}

// TODO everything below is currently unused -- should be removed after check whether it is truely unneeded
/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep an owner reference.
 *
 * @param {Object} target is the prototype
 * @param {string } propertyKey
 */
// export function observablereference(target: DecoratedModelElement, propertyKey: string ) {
//     // const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
//     //
//     // const getter = function(this: any) {
//     //     // console.log("GET observablereference observablereference observablereference observablereference");
//     //     const storedObserver = this[privatePropertyKey] as ObservableValue<MobxModelElementImpl>;
//     //     let result: any = storedObserver ? storedObserver.get() : undefined;
//     //     if (result === undefined) {
//     //         result = null;
//     //         this[privatePropertyKey] = observable.box(result);
//     //     }
//     //     return result;
//     // };
//     //
//     // const setter = function(this: any, val: MobxModelElementImpl) {
//     //     console.log("SET observablereference observablereference observablereference observablereference");
//     //     let storedObserver = this[privatePropertyKey] as ObservableValue<MobxModelElementImpl>;
//     //     const storedValue = storedObserver ? storedObserver.get() : null;
//     //     // Clean owner of current part
//     //     if (storedValue) {
//     //         storedValue.owner = null;
//     //         storedValue.propertyName = "";
//     //         storedValue.propertyIndex = undefined;
//     //     }
//     //     if (storedObserver) {
//     //         storedObserver.set(val);
//     //     } else {
//     //         this[privatePropertyKey] = observable.box(val);
//     //         storedObserver = this[privatePropertyKey];
//     //     }
//     //     if (val !== null && val !== undefined) {
//     //         if (val.owner !== undefined && val.owner !== null) {
//     //             if (val.propertyIndex !== undefined) {
//     //                 // Clean new value from its containing list
//     //                 (val.owner as any)[val.propertyName].splice(val.propertyIndex, 1);
//     //             } else {
//     //                 // Clean new value from its owner
//     //                 (val.owner as any)[MODEL_PREFIX + val.propertyName] = null;
//     //             }
//     //         }
//     //         // Set owner
//     //         val.owner = this;
//     //         val.propertyName = propertyKey.toString();
//     //         val.propertyIndex = undefined;
//     //     }
//     // };
//     //
//     // // tslint:disable no-unused-expression
//     // Reflect.deleteProperty(target, propertyKey);
//     // Reflect.defineProperty(target, propertyKey, {
//     //     get: getter,
//     //     set: setter,
//     //     configurable: true
//     // });
// }

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep an owner reference.
 *
 * @param {Object} target is the prototype
 * @param {string } propertyKey
 */
// export function observablelistreference(target: DecoratedModelElement, propertyKey: string ) {
// }


// export function model1() {
//     return (constructor: new (...args: any[]) => any) => {
//         return constructor;
//     };
// }
