import { DecoratedModelElement, FreNode } from "../ast";
import { FreDelta, FrePartListDelta, FrePartDelta, FrePrimDelta, FrePrimListDelta } from "./FreDelta";
import { FreLogger } from "../logging";
import { PrimType } from "../language";
import { modelUnit } from "../ast-utils";

export type callback = (delta: FreDelta) => void;

const LOGGER: FreLogger = new FreLogger("FreChangeManager").mute();

/**
 * This class dispatches all changes in a model to all its subscribers.
 * Note that changes in standalone FreElements, i.e. those that are not part of a model,
 * are not distributed.
 */

export class FreChangeManager {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): FreChangeManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new FreChangeManager();
        }
        return this.theInstance;
    }

    /**
     * Constructor is private, this implements the singleton pattern
     */
    private constructor() {}

    // the callbacks to be executed upon the different kind of changes to the model
    changePrimCallbacks: callback[] = [];
    changePartCallbacks: callback[] = []; // references are also parts here: the FreElementReference object is treated as part
    changeListElemCallbacks: callback[] = [];
    changeListCallbacks: callback[] = [];

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
        LOGGER.log(
            "ChangeManager: set PART value for " +
                nodeToChange.freLanguageConcept() +
                "[" +
                propertyName +
                "] := " +
                newValue,
        );
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
     * @param value
     */
    public setPrimitive(nodeToChange: FreNode, propertyName: string, value: string | boolean | number): void {
        LOGGER.log(
            "ChangeManager: set PRIMITIVE value for " +
                nodeToChange.freLanguageConcept() +
                "[" +
                propertyName +
                "] := " +
                value,
        );
        if (!!this.changePrimCallbacks) {
            const unit = modelUnit(nodeToChange);
            if (!!unit?.freOwner() || nodeToChange.freIsModel()) {
                const delta: FrePrimDelta = new FrePrimDelta(
                    unit,
                    nodeToChange,
                    propertyName,
                    nodeToChange[propertyName],
                    value,
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
        LOGGER.log(
            "ChangeManager: UPDATE LIST ELEMENT for " +
                owner.freLanguageConcept() +
                "[" +
                propertyName +
                "][ " +
                index +
                "] := " +
                newValue,
        );
        if (!!this.changeListElemCallbacks) {
            const unit = modelUnit(owner);
            if (!!unit?.freOwner() || owner.freIsModel()) {
                const delta: FreDelta = new FrePartDelta(unit, owner, propertyName, oldValue, newValue, index);
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
        LOGGER.log("ChangeManager: UPDATE PART LIST for " + listOwner.freLanguageConcept() + "[" + propertyName + "]");
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
        LOGGER.log(
            "ChangeManager: UPDATE PRIMITIVE LIST for " + listOwner.freLanguageConcept() + "[" + propertyName + "]",
        );
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
        LOGGER.log(
            "ChangeManager: UPDATE LIST ELEMENT for " +
                listOwner.freLanguageConcept() +
                "[" +
                propertyName +
                "][" +
                index +
                "] := " +
                newValue,
        );
        if (!!this.changeListElemCallbacks) {
            const unit = modelUnit(listOwner);
            if (!!unit?.freOwner() || listOwner.freIsModel()) {
                const delta: FreDelta = new FrePrimDelta(unit, listOwner, propertyName, oldValue, newValue, index);
                if (delta !== null && delta !== undefined) {
                    for (const cb of this.changeListElemCallbacks) {
                        cb(delta);
                    }
                }
            }
        }
    }
}
