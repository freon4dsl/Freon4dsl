import { Language, MobxModelElementImpl, observablelistpart, PiModel, PiNamedElement } from "@projectit/core";
import { observable } from "mobx";
import * as uuid from "uuid";
import { SvelteModelUnit } from "./SvelteModelUnit";

export class SvelteModel extends MobxModelElementImpl implements PiModel {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<SvelteModel>): SvelteModel {
        const result = new SvelteModel();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.modelUnits) {
            data.modelUnits.forEach(x => result.modelUnits.push(x));
        }
        return result;
    }

    readonly $typename: string = "Model"; // holds the metatype in the form of a string

    $id: string ;
    @observable name: string = ""; // implementation of name
    @observablelistpart modelUnits: SvelteModelUnit[]; // implementation of models

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = uuid.v4();
        }
    }

    /**
     * Returns the metatype of this instance in the form of a string.
     */
    piLanguageConcept(): string {
        return this.$typename;
    }

    /**
     * Returns the unique identifier of this instance.
     */
    piId(): string {
        return this.$id;
    }

    /**
     * Returns true if this instance is a model concept.
     */
    piIsModel(): boolean {
        return true;
    }

    /**
     * Returns true if this instance is a model unit.
     */
    piIsUnit(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is an expression concept.
     */
    piIsExpression(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a binary expression concept.
     */
    piIsBinaryExpression(): boolean {
        return false;
    }

    /**
     * A convenience method that finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): SvelteModelUnit {
        let result: SvelteModelUnit = null;
        result = this.modelUnits.find(mod => mod.name === name);
        if (!!result && !!metatype) {
            const myMetatype = result.piLanguageConcept();
            if (myMetatype === metatype || Language.getInstance().subConcepts(metatype).includes(myMetatype)) {
                return result;
            }
        } else {
            return result;
        }
        return null;
    }

    /**
     * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
     * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
     * @param oldUnit
     * @param newUnit
     */
    replaceUnit(oldUnit: SvelteModelUnit, newUnit: SvelteModelUnit): boolean {
        if (oldUnit.piLanguageConcept() !== newUnit.piLanguageConcept()) {
            return false;
        }
        if (oldUnit.piContainer().container !== this) {
            return false;
        }
        // we must store the interface in the same place as the old unit, which info is held in PiContainer()
        // TODO review this approach
        if (oldUnit.piLanguageConcept() === "SvelteModelUnit" && oldUnit.piContainer().propertyName === "modelUnits") {
            const index = this.modelUnits.indexOf(oldUnit as SvelteModelUnit);
            this.modelUnits.splice(index, 1, newUnit as SvelteModelUnit);
        } else {
            return false;
        }

        // TODO maybe this is better?
        // if (oldUnit.piContainer().propertyIndex > -1) { // it is a list
        //     this[oldUnit.piContainer().propertyName].splice(oldUnit.piContainer().propertyIndex, 1, newUnit);
        // } else {
        //     this[oldUnit.piContainer().propertyName] = newUnit;
        // }
        return true;
    }

    /**
     * Adds a model unit. Returns false if anything goes wrong.
     *
     * @param newUnit
     */
    addUnit(newUnit: SvelteModelUnit): boolean {
        if (!!newUnit) {
            const myMetatype = newUnit.piLanguageConcept();
            // TODO this depends on the fact the only one part of the model concept has the same type, should we allow differently???
            switch (myMetatype) {
                case "SvelteModelUnit": {
                    this.modelUnits.push(newUnit as SvelteModelUnit);
                    return true;
                }
                default: {
                    this.modelUnits.push(newUnit as SvelteModelUnit);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes a model unit. Returns false if anything goes wrong.
     *
     * @param oldUnit
     */
    removeUnit(oldUnit: SvelteModelUnit): boolean {
        if (!!oldUnit) {
            const myMetatype = oldUnit.piLanguageConcept();
            switch (myMetatype) {
                case "SvelteModelUnit": {
                    this.modelUnits.splice(this.modelUnits.indexOf(oldUnit as SvelteModelUnit), 1);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns an empty model unit of type 'unitTypeName' within 'model'.
     *
     * @param model
     * @param unitTypeName
     */
    newUnit(typename: string): SvelteModelUnit {
        switch (typename) {
            case "SvelteModelUnit": {
                const unit: SvelteModelUnit = new SvelteModelUnit();
                this.modelUnits.push(unit as SvelteModelUnit);
                return unit;
            }
        }
        return null;
    }

    /**
     * Returns a list of model units.
     */
    getUnits(): SvelteModelUnit[] {
        let result: SvelteModelUnit[] = [];
        result = result.concat(this.modelUnits);
        return result;
    }

}
