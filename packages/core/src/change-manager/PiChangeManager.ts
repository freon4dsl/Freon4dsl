import { DecoratedModelElement, PiElement, PiElementBaseImpl, PiElementReference } from "../ast";
import { PiDelta, PiListDelta, PiPartDelta, PiPrimDelta, PiRefDelta } from "./PiDelta";
// import { PiLogger } from "../logging";

export type callback = (delta: PiDelta) => void;

// const LOGGER: PiLogger = new PiLogger("PiChangeManager").mute(); // for now removed, because it causes an error in MobxTest

export class PiChangeManager {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): PiChangeManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new PiChangeManager();
        }
        return this.theInstance;
    }

    /**
     * Constructor is private, this implements the singleton pattern
     */
    private constructor() {
    }

    // the callbacks to be executed upon the different kind of changes to the model
    changePrimCallbacks: callback[] = [];
    changePartCallbacks: callback[] = [];
    changeRefCallbacks: callback[] = [];
    changeListElemCallbacks: callback[] = [];
    changeListCallbacks: callback[] = [];

    /**
     * Reacts to the change of the value of a reference property
     * @param elemToChange
     * @param propertyName
     * @param value
     */
    public setRef(elemToChange: PiElement, propertyName: string, value: DecoratedModelElement): void {
        // LOGGER.log("ChangeManager: set REF value for " + elemToChange.piLanguageConcept() + "[" + propertyName + "] := " + value);
        if(!!this.changeRefCallbacks) {
            const delta: PiRefDelta = new PiRefDelta(elemToChange, propertyName, elemToChange[propertyName], value);
            for(const cb of this.changeRefCallbacks) {
                cb(delta);
            }
        }
    }

    /**
     * Reacts to the change of the value of a part property
     * @param elemToChange
     * @param propertyName
     * @param value
     */
    public setPart(elemToChange: PiElement, propertyName: string, value: DecoratedModelElement): void {
        console.log("ChangeManager: set PART value for " + elemToChange.piLanguageConcept() + "[" + propertyName + "] := " + value);
        if(!!this.changePartCallbacks) {
            const delta: PiPartDelta = new PiPartDelta(elemToChange, propertyName, elemToChange[propertyName], value);
            for(const cb of this.changePartCallbacks) {
                cb(delta);
            }
        }
    }

    /**
     * Reacts to the change of the value of a primitive property
     * @param elemToChange
     * @param propertyName
     * @param value
     */
    public setPrimitive(elemToChange: PiElement, propertyName: string, value: string | boolean | number): void {
        // LOGGER.log("ChangeManager: set PRIMITIVE value for " + elemToChange.piLanguageConcept() + "[" + propertyName + "] := " + value);
        if(!!this.changePrimCallbacks) {
             const delta: PiPrimDelta = new PiPrimDelta(elemToChange, propertyName, elemToChange[propertyName], value);
             for(const cb of this.changePrimCallbacks) {
                 cb(delta);
             }
         }
    }

    /**
     * Reacts to a change of a single element of a list
     * @param newValue
     * @param oldValue
     * @param index
     */
    public updateListElement(newValue: DecoratedModelElement, oldValue: DecoratedModelElement, index: number) {
        const owner = oldValue.$$owner;
        const propertyName: string = oldValue.$$propertyName;
        // LOGGER.log("ChangeManager: UPDATE LIST ELEMENT for " + owner.piLanguageConcept() + "[" + propertyName + "] := " + newValue);
        if(!!this.changeListElemCallbacks) {
            // TODO this does not work for lists of refs or prims!!
            const delta: PiPartDelta = new PiPartDelta(owner, propertyName, oldValue, newValue, index);
            for(const cb of this.changeListElemCallbacks) {
                cb(delta);
            }
        }
    }

    /**
     * Reacts to a change in a complete list, like adding or removing elements.
     * @param listOwner     the owner of the list
     * @param propertyName  the name of the property in the owner that refers to the list
     * @param index         the index from which the change has taken place
     * @param removedCount  number of elements that are removed
     * @param added         the elements to be added
     */
    public updateList(listOwner: PiElement, propertyName: string, index: number, removedCount: number, added: DecoratedModelElement[]) {
        // LOGGER.log("ChangeManager: UPDATE LIST for " + listOwner.piLanguageConcept() + "[" + propertyName + "]");
        if(!!this.changeListCallbacks) {
            const delta: PiListDelta = new PiListDelta(listOwner, propertyName, index, removedCount, added);
            for(const cb of this.changeListCallbacks) {
                cb(delta);
            }
        }
    }
}
