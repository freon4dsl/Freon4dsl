import { Box } from "./internal";
import { PiElement } from "../ast";
import { PiTableDefinition } from "./PiTables";
import { OldPiCompositeProjection } from "./OldPiCompositeProjection";

/**
 * Interface for the projection.
 */
export interface OldPiProjection {
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

    rootProjection: OldPiCompositeProjection;
    name: string;
    isEnabled: boolean;
}