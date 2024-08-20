import { observablepart, FreNodeBaseImpl, FreModel } from "../../../ast";
import { FreUtils } from "../../../util";
import { FreLanguage } from "../../../language";
import { UndoUnit } from "./UndoUnit";

/**
 * Class UndoModel is the implementation of the model with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to the changes in the state of its properties.
 */
export class UndoModel extends FreNodeBaseImpl implements FreModel {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<UndoModel>): UndoModel {
        const result = new UndoModel();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.unit) {
            result.unit = data.unit;
        }
        if (!!data.parseLocation) {
            result.parseLocation = data.parseLocation;
        }
        return result;
    }

    readonly $typename: string = "UndoModel"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    name: string; // implementation of name
    unit: UndoUnit; // implementation of part 'unit'

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = FreUtils.ID(); // uuid.v4();
        }

        // Both 'observablepart' and 'observablepartlist' change the get and set of the attribute
        // such that the parent-part relationship is consistently maintained,
        // and make sure the part is observable. In lists no 'null' or 'undefined' values are allowed.
        observablepart(this, "unit");
    }

    /**
     * Returns the metatype of this instance in the form of a string.
     */
    freLanguageConcept(): string {
        return this.$typename;
    }

    /**
     * Returns the unique identifier of this instance.
     */
    freId(): string {
        return this.$id;
    }

    /**
     * Returns true if this instance is a model concept.
     */
    freIsModel(): boolean {
        return true;
    }

    /**
     * Returns true if this instance is a model unit.
     */
    freIsUnit(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is an expression concept.
     */
    freIsExpression(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a binary expression concept.
     */
    freIsBinaryExpression(): boolean {
        return false;
    }
    /**
     * A convenience method that copies this instance into a new object.
     */
    copy(): UndoModel {
        const result = new UndoModel();
        if (!!this.name) {
            result.name = this.name;
        }
        if (!!this.unit) {
            result.unit = this.unit.copy();
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<UndoModel>): boolean {
        let result: boolean = true;
        if (result && toBeMatched.name !== null && toBeMatched.name !== undefined && toBeMatched.name.length > 0) {
            result = result && this.name === toBeMatched.name;
        }
        if (result && !!toBeMatched.unit) {
            result = result && this.unit.match(toBeMatched.unit);
        }
        return result;
    }

    /**
     * A convenience method that finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): UndoUnit {
        let result: UndoUnit = null;
        if (this.unit.name === name) {
            result = this.unit;
        }
        if (!!result && !!metatype) {
            if (FreLanguage.getInstance().metaConformsToType(result, metatype)) {
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
    replaceUnit(oldUnit: UndoUnit, newUnit: UndoUnit): boolean {
        if (oldUnit.freLanguageConcept() !== newUnit.freLanguageConcept()) {
            return false;
        }
        if (oldUnit.freOwnerDescriptor().owner !== this) {
            return false;
        }
        // we must store the interface in the same place as the old unit, which info is held in FreContainer()
        if (oldUnit.freLanguageConcept() === "UndoUnit" && oldUnit.freOwnerDescriptor().propertyName === "unit") {
            this.unit = newUnit as UndoUnit;
        } else {
            return false;
        }
        return true;
    }

    /**
     * Adds a model unit. Returns false if anything goes wrong.
     *
     * @param newUnit
     */
    addUnit(newUnit: UndoUnit): boolean {
        if (!!newUnit) {
            const myMetatype = newUnit.freLanguageConcept();
            switch (myMetatype) {
                case "UndoUnit": {
                    this.unit = newUnit as UndoUnit;
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
    removeUnit(oldUnit: UndoUnit): boolean {
        if (!!oldUnit) {
            const myMetatype = oldUnit.freLanguageConcept();
            switch (myMetatype) {
                case "UndoUnit": {
                    this.unit = null;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns an empty model unit of type 'unitTypeName' within 'model'.
     *
     * @param typename
     */
    newUnit(typename: string): UndoUnit {
        switch (typename) {
            case "UndoUnit": {
                const unit: UndoUnit = new UndoUnit();
                this.unit = unit as UndoUnit;
                return unit;
            }
        }
        return null;
    }

    /**
     * Returns a list of model units.
     */
    getUnits(): UndoUnit[] {
        const result: UndoUnit[] = [];
        if (!!this.unit) {
            result.push(this.unit);
        }
        return result;
    }

    /**
     * Returns a list of model units of type 'type'.
     */
    getUnitsForType(type: string): UndoUnit[] {
        switch (type) {
            case "UndoUnit": {
                const result: UndoUnit[] = [];
                result.push(this.unit);
                return result;
            }
        }
        return [];
    }
}
