import { PiNamedElement } from "./PiNamedElement";
import { PiModelUnit } from "./PiModelUnit";

// TODO rethink inheritance from PiNamedElement: no match method needed here
export interface PiModel extends PiNamedElement {
    /**
     * Finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): PiModelUnit;

    /**
     * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
     * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
     *
     * @param oldUnit
     * @param newUnit
     */
    replaceUnit(oldUnit: PiModelUnit, newUnit: PiModelUnit): boolean;

    /**
     * Adds a model unit. Returns false if anything goes wrong.
     *
     * @param newUnit
     */
    addUnit(newUnit: PiModelUnit): boolean;

    /**
     * Removes a model unit. Returns false if anything goes wrong.
     *
     * @param oldUnit
     */
    removeUnit(oldUnit: PiModelUnit): boolean;

    /**
     * Returns an empty model unit of type 'typename' and adds it to this model.
     *
     * @param typename
     */
    newUnit(typename: string): PiModelUnit;

    /**
     * Returns a list of model units.
     */
    getUnits(): PiModelUnit[];

    /**
     * Returns a list of model units of type 'type'.
     */
    getUnitsForType(type: string): PiModelUnit[];
}
// end::model-interface[]
