import { Box, PiCompositeProjection } from "./internal";
import { PiElement } from "../language";
import { PiTableDefinition } from "./PiTables";

/**
 * Interface for the projection.
 */
// tag::PiProjection[]
export interface PiProjection {
    /**
     * returns the box for `element`.
     */
    getBox(element: PiElement): Box;

    /**
     * returns the table cells for `element`.
     */
    getTableDefinition(conceptName: string): PiTableDefinition ;

    rootProjection: PiCompositeProjection;
    name: string;
}
// end::PiProjection[]
