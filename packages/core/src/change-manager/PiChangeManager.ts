import { DecoratedModelElement, PiElement } from "../ast";
import { PiDelta, PiListDelta, PiPartDelta, PiPrimDelta } from "./PiDelta";
import { PiLogger } from "../logging";
import { Language, PrimType } from "../language";

export type callback = (delta: PiDelta) => void;

const LOGGER: PiLogger = new PiLogger("PiChangeManager"); //.mute(); // for now removed, because it causes an error in MobxTest

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
    changePartCallbacks: callback[] = []; // references are also parts here: the PiElementReference object is treated as part
    changeListElemCallbacks: callback[] = [];
    changeListCallbacks: callback[] = [];

    /**
     * Reacts to the change of the value of a part property
     * @param elemToChange
     * @param propertyName
     * @param newValue
     */
    public setPart(elemToChange: PiElement, propertyName: string, newValue: DecoratedModelElement, oldValue: DecoratedModelElement): void {
        LOGGER.log("ChangeManager: set PART value for " + elemToChange.piLanguageConcept() + "[" + propertyName + "] := " + newValue);
        if(!!this.changePartCallbacks) {
            const delta: PiPartDelta = new PiPartDelta(elemToChange, propertyName, oldValue, newValue);
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
        LOGGER.log("ChangeManager: set PRIMITIVE value for " + elemToChange.piLanguageConcept() + "[" + propertyName + "] := " + value);
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
    public updatePartListElement(newValue: DecoratedModelElement, oldValue: DecoratedModelElement, index: number) {
        const owner: PiElement = oldValue.$$owner;
        const propertyName: string = oldValue.$$propertyName;
        LOGGER.log("ChangeManager: UPDATE LIST ELEMENT for " + owner.piLanguageConcept() + "[" + propertyName + "][ " + index + "] := " + newValue);
        if(!!this.changeListElemCallbacks) {
            let delta: PiDelta = null;
            // find the kind of the property that is changed: "part"/"reference" or "prim"
            const kind = Language.getInstance().classifierProperty(owner.piLanguageConcept(), propertyName)?.propertyKind;
            if ( kind === "part" || kind === "reference" ) {
                delta = new PiPartDelta(owner, propertyName, oldValue, newValue, index);
            } else if ( kind === "primitive" ) {
                // delta = new PiPrimDelta(owner, propertyName, oldValue, newValue, index);
            }
            if (delta !== null && delta !== undefined) {
                for (const cb of this.changeListElemCallbacks) {
                    cb(delta);
                }
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
    public updatePartList(listOwner: PiElement, propertyName: string, index: number, removed: DecoratedModelElement[], added: DecoratedModelElement[]) {
        LOGGER.log("ChangeManager: UPDATE LIST for " + listOwner.piLanguageConcept() + "[" + propertyName + "]");
        if(!!this.changeListCallbacks) {
            const delta: PiListDelta = new PiListDelta(listOwner, propertyName, index, removed, added);
            for(const cb of this.changeListCallbacks) {
                cb(delta);
            }
        }
    }

    public updatePrimList(listOwner: any, propertyName: string, index: number, removed: PrimType[], added: PrimType[]) {

    }

    public updatePrimListElement(newValue: string | number | boolean, oldValue: string | number | boolean, index: number) {

    }
}
