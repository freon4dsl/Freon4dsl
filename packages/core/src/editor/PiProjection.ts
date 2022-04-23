import { Box, PiCompositeProjection } from "./internal";
import { PiElement } from "../model";
import { PiTableDefinition } from "./PiTables";

/**
 * Interface for the projection.
 */
// tag::PiProjection[]
export interface PiProjection {
    /**
     * Returns the box for `element`. If 'nameOfSuper' is present, it returns the box for the
     * super concept or implemented interface with that name.
     *
     * @param element
     * @param nameOfSuper if present, the name of a super concept or implemented interface of 'element'
     */
    getBox(element: PiElement, nameOfSuper?: string): Box;

    /**
     * returns the table cells for `element`.
     */
    getTableDefinition(conceptName: string): PiTableDefinition ;

    rootProjection: PiCompositeProjection;
    name: string;
    isEnabled: boolean;
}
// end::PiProjection[]
