import type { FreNamedNode } from "./FreNamedNode.js";
import type { FreModelUnit } from "./FreModelUnit.js";

// TODO rethink inheritance from FreNamedElement: no match method needed here
export interface FreModel extends FreNamedNode {
    /**
     * Finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): FreModelUnit | undefined;

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
     * Returns undefined when the given 'typename' does not match any of the unit types
     * known in the language.
     *
     * @param typename
     */
    newUnit(typename: string): FreModelUnit | undefined;

    /**
     * Returns a list of model units.
     */
    getUnits(): FreModelUnit[];

    /**
     * Returns a list of model units of type 'type'.
     */
    getUnitsForType(type: string): FreModelUnit[];
}
