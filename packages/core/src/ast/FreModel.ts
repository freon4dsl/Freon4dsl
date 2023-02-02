import { FreNamedNode } from "./FreNamedNode";
import { FreModelUnit } from "./FreModelUnit";

// TODO rethink inheritance from FreNamedElement: no match method needed here
export interface FreModel extends FreNamedNode {
    /**
     * Finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): FreModelUnit;

    /**
     * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
     * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
     *
     * @param oldUnit
     * @param newUnit
     */
    replaceUnit(oldUnit: FreModelUnit, newUnit: FreModelUnit): boolean;

    /**
     * Adds a model unit. Returns false if anything goes wrong.
     *
     * @param newUnit
     */
    addUnit(newUnit: FreModelUnit): boolean;

    /**
     * Removes a model unit. Returns false if anything goes wrong.
     *
     * @param oldUnit
     */
    removeUnit(oldUnit: FreModelUnit): boolean;

    /**
     * Returns an empty model unit of type 'typename' and adds it to this model.
     *
     * @param typename
     */
    newUnit(typename: string): FreModelUnit;

    /**
     * Returns a list of model units.
     */
    getUnits(): FreModelUnit[];

    /**
     * Returns a list of model units of type 'type'.
     */
    getUnitsForType(type: string): FreModelUnit[];
}
