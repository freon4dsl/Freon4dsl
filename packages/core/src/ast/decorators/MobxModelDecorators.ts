import { IObservableValue, IArrayWillChange, IArrayWillSplice, observable, intercept, runInAction } from "mobx";
import "reflect-metadata";

import { DecoratedModelElement } from "./DecoratedModelElement";
import { PiChangeManager } from "../../change-manager";
import { PrimType } from "../../language";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("MobxDecorators");

export const MODEL_PREFIX = "_PI_";
export const MODEL_PREFIX_LENGTH = MODEL_PREFIX.length;
export const MODEL_CONTAINER = MODEL_PREFIX + "Container";
export const MODEL_NAME = MODEL_PREFIX + "Name";

/**
 *
 * This property decorator can be used to decorate properties of type PiElement.
 * The objects in such properties will automatically keep an owner reference.
 *
 * @param target        the owner of the property
 * @param propertyKey   the name of the property
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

/**
 *
 * This property decorator can be used to decorate properties of type PiElement[].
 *
 * @param target        the owner of the property
 * @param propertyKey   the name of the property
 */
export function observablepartlist(target: Object, propertyKey: string) {
    observablelist(target, propertyKey, false);
}

/**
 *
 * This property decorator can be used to decorate properties of type string | number | boolean.
 *
 * @param target        the owner of the property
 * @param propertyKey   the name of the property
 */
export function observableprim(target: DecoratedModelElement, propertyKey: string ) {
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
 * This property decorator can be used to decorate properties of type string[] | number[] | boolean[].
 *
 * @param target        the owner of the property
 * @param propertyKey   the name of the property
 */
export function observableprimlist(target: Object, propertyKey: string) {
    observablelist(target, propertyKey, true);
}

/**
 * This function does the actual work for observableprimlist and observablepartlist
 * @param target
 * @param propertyKey
 * @param isPrimitive
 */
function observablelist(target: Object, propertyKey: string, isPrimitive: boolean ) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        return this[privatePropertyKey];
    };

    // TODO add setter => this enables setting a list like this: "list = [elem1, elem2]"

    const array = observable.array([], { deep: false });
    target[privatePropertyKey] = array;
    (array as any)[MODEL_CONTAINER] = target;
    (array as any)[MODEL_NAME] = propertyKey.toString();
    if (!isPrimitive) {
        intercept(array, change => objectWillChange(change)); // Since mobx6
    } else {
        intercept(array, change => primWillChange(change));
    }

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
    // TODO improve: check whether index is an Array
    if (!(typeof index === "number")) {
        // console.trace("=====================================");
        // console.log("MOBX ARRAY change Index type " + typeof index);
        // // (index as any) because of TS2407:  The right-hand side of a 'for...in' statement must be
        // //       of type 'any', an object type or a type parameter, but here has type 'never'.
        // for (const pp in index as any) {
        //     console.log("        key " + pp + " type " + typeof index[pp]);
        // }
        index = index[0];
    }
    return index;
}

/**
 * Resets the Owner descriptor information in 'element' to the given values.
 * @param element       the list element that holds owner information
 * @param listOwner     the owner of the list
 * @param propertyName  the name of the property that 'is' the list
 * @param index         the index of 'element' in the list
 */
function resetOwner(element: DecoratedModelElement, listOwner, propertyName: string, index: number) {
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
        element.$$propertyIndex = index;
    }
}

/**
 * Cleans any existing owner descriptor information from a list element.
 * @param oldValue
 */
function cleanOwner(oldValue: DecoratedModelElement) {
    oldValue.$$owner = null;
    oldValue.$$propertyName = "";
    oldValue.$$propertyIndex = undefined;
}

/**
 * Function called when an array element is changed, will ensure
 * that the old element is removed and its owner reference is cleared.
 * The new element will have its owner reference set correctly.
 * Also ensures that no null or undefined values are in the list.
 * Note: for lists of type PiElement[].
 * @param change
 */
function objectWillChange(
    change: IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement>
): IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement> | null {

    switch (change.type) {
        case "update":
            const newValue = change.newValue;
            const oldValue = change.object[change.index];

            console.log("replacing " + oldValue?.toString() + " with " + newValue?.toString());
            if (newValue !== null && newValue !== undefined) {
                PiChangeManager.getInstance().updatePartListElement(newValue, oldValue, change.index);
                if (newValue !== oldValue) {
                    // cleanup old owner reference of new value
                    resetOwner(newValue, oldValue.$$owner, oldValue.$$propertyName, oldValue.$$propertyIndex);
                    // cleanup owner reference of old value
                    cleanOwner(oldValue);
                }
            } else {
                // delete old value from list and do not return this change - it should not be executed
                change.object.splice(oldValue.$$propertyIndex, 1);
                // TODO 'this' should be removed for something useful
                LOGGER.error("Attempt to assign null to element of observable list: element is removed.");
                return null;
            }
            break;
        case "splice":
            let index: number = checkIndexType(change.index);
            const removedCount: number = change.removedCount;
            // find all elements that need to be removed
            const removed: any[] = [];
            for (let num = 0; num < removedCount; num++) {
                removed.push(change.object[index + num]);
            }
            // find all elements that need to be added
            const added: DecoratedModelElement[] = change.added;
            let addedCount = added.length;
            // find the list owner and the name of the property that holds the list
            const listOwner = (change.object as any)[MODEL_CONTAINER];
            const propertyName: string = (change.object as any)[MODEL_NAME];

            // change the owner info in the elements to be added, if any
            let i: number = 0;
            added.forEach(element => {
                if (element !== null && element !== undefined) {
                    // cleanup old owner reference of new value, if present, and set the new owner info
                    resetOwner(element, listOwner, propertyName, index + Number(i++));
                } else {
                    // remove any null values: we do not want any null values added to the list
                    change.added.splice(i, 1);  // do not increase i !!!
                    addedCount--;
                    LOGGER.error("Ignored attempt to add null or undefined to observable list of objects.")
                }
            });
            // change the owner info in the elements to be removed, if any
            for (const rem of removed) {
                cleanOwner(rem);
            }
            // update all other indices
            for (let above = index; above < change.object.length; above++) {
                const aboveElement = change.object[above];
                if (aboveElement.$$propertyIndex !== undefined) {
                    aboveElement.$$propertyIndex += addedCount - removedCount;
                }
            }
            // make sure the change is propagated to listeners
            // note we use 'change.added' here because this list might be different from 'added'
            PiChangeManager.getInstance().updatePartList(listOwner, propertyName, index, removed, change.added);
            break;
    }
    return change;
}
/**
 * Function called when an array element is changed, will ensure
 * that no null or undefined values are in the list.
 * Note: for lists of type string[] | boolean[] | number[].
 * @param change
 */
function primWillChange(
    change: IArrayWillChange<PrimType> | IArrayWillSplice<PrimType>
): IArrayWillChange<PrimType> | IArrayWillSplice<PrimType> | null {
    // console.log("primWillChange [" + change.type + "]");
    switch (change.type) {
        case "update":
            const newValue: PrimType = change.newValue;
            const oldValue: PrimType = change.object[change.index];
            if (newValue !== null && newValue !== undefined) {
                PiChangeManager.getInstance().updatePrimListElement(newValue, oldValue, change.index);
            } else {
                // delete old value from list and do not return this change - it should not be executed
                change.object.splice(change.index, 1);
                // TODO 'this' should be removed for something useful
                LOGGER.error("Ignored attempt to add null or undefined to observable list of primitives.");
                return null;
            }
            break;
        case "splice":
            let index: number = checkIndexType(change.index);
            const removedCount: number = change.removedCount;
            // find all elements that need to be removed
            const removed: PrimType[] = [];
            for (let num = 0; num < removedCount; num++) {
                removed.push(change.object[index + num]);
            }
            // find all elements that need to be added
            const added: PrimType[] = change.added;
            // find the list owner and the name of the property that holds the list
            const listOwner = (change.object as any)[MODEL_CONTAINER];
            const propertyName: string = (change.object as any)[MODEL_NAME];
            added.forEach((element, i) => {
                if (element === null || element === undefined) {
                    // remove any null values: we do not want any null values added to the list
                    change.added.splice(i, 1);
                    LOGGER.error("Ignored attempt to add null or undefined to observable list of objects.")
                }
            });
            // make sure the change is propagated to listeners
            // note we use 'change.added' here because this list might be different from 'added'
            PiChangeManager.getInstance().updatePrimList(listOwner, propertyName, index, removed, change.added);
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
