import { IObservableValue, IArrayWillChange, IArrayWillSplice, observable, intercept, runInAction } from "mobx";
import "reflect-metadata";
import { FreNode } from "../FreNode";

import { allOwners, DecoratedModelElement } from "./DecoratedModelElement";
import { FreChangeManager } from "../../change-manager";
import { PrimType } from "../../language";
import { FreLogger } from "../../logging";

const LOGGER: FreLogger = new FreLogger("MobxDecorators").mute();

/**
 * The set of functions in this file all add extra functionality to the mobx observers.
 * They make sure that:
 *  1. all FreElements have information on the object that 'owns' them: the FreOwnerDescriptor information is set,
 *  2. all FreElements have just 1 owner: when an element is assigned to another property, its previous owner is
 *  set to null, or in case the previous property is a list, it is removed from this list,
 *  2. all observable lists do not contain null or undefined values,
 *  4. all changes in the model are reported to the FreChangeManager, which distributes this information to
 *  any object that is subscribed to it.
 *
 *  Note that a difference is made only between properties with primitive value (i.e. string | number | boolean) and
 *  properties with an object value. There is no difference between 'part' and 'reference' properties. Both are handled
 *  as properties with object values.
 */

export const MODEL_PREFIX = "_FRE_";
export const MODEL_PREFIX_LENGTH = MODEL_PREFIX.length;
export const MODEL_CONTAINER = MODEL_PREFIX + "Container";
export const MODEL_NAME = MODEL_PREFIX + "Name";

/**
 *
 * This property decorator can be used to decorate properties of type FreNode.
 * The objects in such properties will automatically keep an owner reference.
 *
 * @param target        the owner of the property
 * @param propertyKey   the name of the property
 */
export function observablepart(target: DecoratedModelElement, propertyKey: string) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function (this: any) {
        const storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        if (!!storedObserver) {
            return storedObserver.get();
        } else {
            this[privatePropertyKey] = observable.box(null);
            return this[privatePropertyKey].get();
        }
    };

    const setter = function (this: any, newValue: DecoratedModelElement) {
        let storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        const storedValue = !!storedObserver ? storedObserver.get() : null;
        // console.log("newValue is " + JSON.stringify(newValue) );
        // tslint:disable-next-line:max-line-length
        // console.log("newValue is " + JSON.stringify(newValue, ["$typename", "$id"]) + " owners: " + JSON.stringify(allOwners(this as any as FreNode), ["$typename", "$id"]) );
        if (allOwners(this as any as FreNode).includes(newValue as any as FreNode)) {
            throw Error("CYCLE IN AST");
            // } else {
            //     console.log("No cycle in Ast, owners: " + allOwners(newValue as any as FreNode).length);
        }

        FreChangeManager.getInstance().setPart(this, propertyKey, newValue, storedValue);
        // Clean owner of current part
        if (!!storedValue) {
            storedValue.$$owner = null;
            storedValue.$$propertyName = "";
            storedValue.$$propertyIndex = undefined;
        }
        if (!!storedObserver) {
            runInAction(() => {
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
        configurable: true,
    });
}

/**
 *
 * This property decorator can be used to decorate properties of type FreNode[].
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
export function observableprim(target: DecoratedModelElement, propertyKey: string) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
    const getter = function (this: any) {
        const storedObserver = this[privatePropertyKey] as IObservableValue<string | number | boolean>;
        if (!!storedObserver) {
            return storedObserver.get();
        } else {
            this[privatePropertyKey] = observable.box(null);
            return this[privatePropertyKey].get();
        }
    };

    const setter = function (this: any, newValue: string | number | boolean) {
        FreChangeManager.getInstance().setPrimitive(this, propertyKey, newValue);

        let storedObserver = this[privatePropertyKey] as IObservableValue<string | number | boolean>;

        if (!!storedObserver) {
            runInAction(() => {
                storedObserver.set(newValue);
            });
        } else {
            storedObserver = observable.box(newValue);
            this[privatePropertyKey] = storedObserver;
        }
    };
    // tslint:disable no-unused-expression
    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        configurable: true,
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
function observablelist(target: Object, propertyKey: string, isPrimitive: boolean) {
    const privatePropertyKey = MODEL_PREFIX + propertyKey;

    const getter = function (this: any) {
        return this[privatePropertyKey];
    };

    // TODO add setter => this enables setting a list like this: "list = [elem1, elem2]"

    const array = observable.array([], { deep: false });
    target[privatePropertyKey] = array;
    (array as any)[MODEL_CONTAINER] = target;
    (array as any)[MODEL_NAME] = propertyKey.toString();
    if (!isPrimitive) {
        intercept(array, (change) => objectWillChange(change, propertyKey)); // Since mobx6
    } else {
        intercept(array, (change) => primWillChange(change, target, propertyKey));
    }

    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter,
    });
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
            // remove the element from its previous owner
            if (element.$$propertyIndex !== undefined) {
                (element.$$owner as any)[element.$$propertyName].splice(element.$$propertyIndex, 1);
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
 * Note: the function is used for lists of type FreNode[], for
 * lists of primitives values 'primWillChange' is used.
 *
 * @param change        the change on the array
 * @param propertyKey   name of the property that is about to change, only used for error message
 */
function objectWillChange(
    change: IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement>,
    propertyKey: string,
): IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement> | null {
    switch (change.type) {
        case "update":
            const newValue = change.newValue;
            if (newValue !== null && newValue !== undefined) {
                const oldValue = change.object[change.index];
                FreChangeManager.getInstance().updatePartListElement(newValue, oldValue, change.index);
                if (newValue !== oldValue) {
                    // cleanup old owner reference of new value
                    resetOwner(newValue, oldValue.$$owner, oldValue.$$propertyName, oldValue.$$propertyIndex);
                    // cleanup owner reference of old value
                    cleanOwner(oldValue);
                }
            } else {
                // instead of assigning, remove this element --- do not add to change manager, this will be done by the splice command
                change.object.splice(change.index, 1);
                LOGGER.info(
                    `Attempt to assign null to element of observable list '${propertyKey}': element is removed.`,
                );
                // do not return this change - it should not be executed
                return null;
            }
            break;
        case "splice":
            const index: number = change.index;
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
            added.forEach((element) => {
                if (element !== null && element !== undefined) {
                    // cleanup old owner reference of new value, if present, and set the new owner info
                    resetOwner(element, listOwner, propertyName, index + Number(i++));
                } else {
                    // remove any null values: we do not want any null values added to the list
                    change.added.splice(i, 1); // do not increase i !!!
                    addedCount--;
                    LOGGER.info(`Ignored attempt to add null or undefined to observable list '${propertyKey}'.`);
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
            FreChangeManager.getInstance().updatePartList(listOwner, propertyName, index, removed, change.added);
            break;
    }
    return change;
}
/**
 * Function called when an array element is changed, will ensure
 * that no null or undefined values are in the list.
 * Note: only used for lists of type string[] | boolean[] | number[].
 * @param change
 * @param target
 * @param propertyKey
 */
function primWillChange(
    change: IArrayWillChange<PrimType> | IArrayWillSplice<PrimType>,
    target: any,
    propertyKey: string,
): IArrayWillChange<PrimType> | IArrayWillSplice<PrimType> | null {
    // LOGGER.log("primWillChange [" + change.type + "]");
    switch (change.type) {
        case "update":
            const newValue: PrimType = change.newValue;
            const oldValue: PrimType = change.object[change.index];
            if (newValue !== null && newValue !== undefined) {
                // console.log("change.object: " + target["name"] + ", propertyName: " + propertyKey);
                FreChangeManager.getInstance().updatePrimListElement(
                    target,
                    propertyKey,
                    newValue,
                    oldValue,
                    change.index,
                );
            } else {
                // instead of assigning, remove this element --- do not add to change manager, this will be done by the splice command
                change.object.splice(change.index, 1);
                LOGGER.info(
                    `Attempt to assign null to element of observable list '${propertyKey}': element is removed.`,
                );
                // do not return this change - it should not be executed
                return null;
            }
            break;
        case "splice":
            const index: number = change.index;
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
                    LOGGER.info(`Ignored attempt to add null or undefined to observable list '${propertyKey}'.`);
                }
            });
            // make sure the change is propagated to listeners
            // note we use 'change.added' here because this list might be different from 'added'
            FreChangeManager.getInstance().updatePrimList(listOwner, propertyName, index, removed, change.added);
            break;
    }
    return change;
}
