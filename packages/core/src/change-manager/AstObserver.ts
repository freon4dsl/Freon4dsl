import type { DecoratedModelElement, FreNode } from "../ast/index.js";
import { FrePartListDelta, FrePartDelta, FrePrimDelta, FrePrimListDelta } from "./FreDelta.js";
import { FreLogger } from "../logging/index.js";
import type { PrimType } from "../language/index.js";
import { modelUnit } from "../ast-utils/index.js";

export type PrimChangeCallback = (delta: FrePrimDelta) => void;
export type PartChangeCallback = (delta: FrePartDelta) => void;
export type ListElementChangeCallback = (delta: FrePartDelta | FrePrimDelta) => void;
export type ListChangeCallback = (delta: FrePartListDelta | FrePrimListDelta) => void;

const LOGGER: FreLogger = new FreLogger("AstObserver").mute();

/**
 * This class dispatches all changes in a model to all its subscribers.
 * Note that changes in a standalone FreNode, i.e. those that are not part of a model,
 * are not distributed.
 */

export class AstObserver {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): AstObserver {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new AstObserver();
        }
        return this.theInstance;
    }

    /**
     * Constructor is private, this implements the singleton pattern
     */
    private constructor() {}

    // the callbacks to be executed upon the different kind of changes to the model
    private changePrimCallbacks: PrimChangeCallback[] = [];
    private changePartCallbacks: PartChangeCallback[] = []; // references are also parts here: the FreNodeReference object is treated as part
    private changeListElemCallbacks: ListElementChangeCallback[] = [];
    private changeListCallbacks: ListChangeCallback[] = [];

    public subscribeToPrimitive(callback: PrimChangeCallback) {
        AstObserver.getInstance().changePrimCallbacks.push(callback);
    }

    public subscribeToPart(callback: PartChangeCallback) {
        AstObserver.getInstance().changePartCallbacks.push(callback);
    }

    public subscribeToListElement(callback: ListElementChangeCallback) {
        AstObserver.getInstance().changeListElemCallbacks.push(callback);
    }

    public subscribeToList(callback: ListChangeCallback) {
        AstObserver.getInstance().changeListCallbacks.push(callback);
    }

    /**
     * Reacts to the change of the value of a part property
     * @param nodeToChange
     * @param propertyName
     * @param newValue
     * @param oldValue
     */
    public setPart(
        nodeToChange: FreNode,
        propertyName: string,
        newValue: DecoratedModelElement,
        oldValue: DecoratedModelElement,
    ): void {
        LOGGER.log(`setPart: ${nodeToChange.freLanguageConcept()} [${propertyName}] := ${newValue}`);
        if (!!this.changePartCallbacks) {
            const unit = modelUnit(nodeToChange);
            if (!!unit?.freOwner() || nodeToChange.freIsModel()) {
                const delta: FrePartDelta = new FrePartDelta(unit, nodeToChange, propertyName, oldValue, newValue);
                for (const cb of this.changePartCallbacks) {
                    cb(delta);
                }
            }
        }
    }

    /**
     * Reacts to the change of the value of a primitive property
     * @param nodeToChange
     * @param propertyName
     * @param oldValue
     * @param newValue
     */
    public setPrimitive(nodeToChange: FreNode, propertyName: string, oldValue:  string | boolean | number, newValue: string | boolean | number): void {
        LOGGER.log(`setPrimitive: ${nodeToChange.freLanguageConcept()}[${propertyName}] := ${newValue}`);
        if (!!this.changePrimCallbacks) {
            const unit = modelUnit(nodeToChange);
            if (!!unit?.freOwner() || nodeToChange.freIsModel()) {
                const delta: FrePrimDelta = new FrePrimDelta(
                    unit,
                    nodeToChange,
                    propertyName,
                    oldValue,
                    newValue,
                );
                for (const cb of this.changePrimCallbacks) {
                    cb(delta);
                }
            }
        }
    }

    /**
     * Reacts to a change of a single element of a list
     * @param newValue
     * @param oldValue
     * @param index
     */
    public updatePartListElement(newValue: DecoratedModelElement, oldValue: DecoratedModelElement, index: number) {
        const owner: FreNode = oldValue.$$owner;
        const propertyName: string = oldValue.$$propertyName;
        LOGGER.log(`updatePartListElement: ${owner.freLanguageConcept()}[${propertyName}][${index}] := ${newValue}`);
        if (!!this.changeListElemCallbacks) {
            const unit = modelUnit(owner);
            if (!!unit?.freOwner() || owner.freIsModel()) {
                const delta: FrePartDelta = new FrePartDelta(unit, owner, propertyName, oldValue, newValue, index);
                if (delta !== null && delta !== undefined) {
                    for (const cb of this.changeListElemCallbacks) {
                        cb(delta);
                    }
                }
            }
        }
    }

    /**
     * Reacts to a change in a complete list, like adding or removing elements.
     * @param listOwner     the owner of the list
     * @param propertyName  the name of the property in the owner that refers to the list
     * @param index         the index from which the change has taken place
     * @param removed       number of elements that are removed
     * @param added         the elements to be added
     */
    public updatePartList(
        listOwner: FreNode,
        propertyName: string,
        index: number,
        removed: DecoratedModelElement[],
        added: DecoratedModelElement[],
    ) {
        LOGGER.log(`updatePartList: ${listOwner.freLanguageConcept()}[${propertyName}][${index}]`);
        if (!!this.changeListCallbacks) {
            const unit = modelUnit(listOwner);
            if (!!unit?.freOwner() || listOwner.freIsModel()) {
                const delta: FrePartListDelta = new FrePartListDelta(
                    unit,
                    listOwner,
                    propertyName,
                    index,
                    removed,
                    added,
                );
                for (const cb of this.changeListCallbacks) {
                    cb(delta);
                }
            }
        }
    }

    public updatePrimList(listOwner: any, propertyName: string, index: number, removed: PrimType[], added: PrimType[]) {
        LOGGER.log(`updatePrimList: ${listOwner.freLanguageConcept()}[${propertyName}][${index}]`);
        if (!!this.changeListCallbacks) {
            const unit = modelUnit(listOwner);
            if (!!unit?.freOwner() || listOwner.freIsModel()) {
                const delta: FrePrimListDelta = new FrePrimListDelta(
                    unit,
                    listOwner,
                    propertyName,
                    index,
                    removed,
                    added,
                );
                for (const cb of this.changeListCallbacks) {
                    cb(delta);
                }
            }
        }
    }

    public updatePrimListElement(
        listOwner: FreNode,
        propertyName: string,
        newValue: string | number | boolean,
        oldValue: string | number | boolean,
        index: number,
    ) {
        LOGGER.log(`updatePrimListElement: ${listOwner.freLanguageConcept()}[${propertyName}][${index}] := ${newValue}`);
        if (!!this.changeListElemCallbacks) {
            const unit = modelUnit(listOwner);
            if (!!unit?.freOwner() || listOwner.freIsModel()) {
                const delta: FrePrimDelta = new FrePrimDelta(unit, listOwner, propertyName, oldValue, newValue, index);
                if (delta !== null && delta !== undefined) {
                    for (const cb of this.changeListElemCallbacks) {
                        cb(delta);
                    }
                }
            }
        }
    }
}
