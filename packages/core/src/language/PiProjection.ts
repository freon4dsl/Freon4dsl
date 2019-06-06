import { Box } from "../boxes";
import { PiElement } from "./PiModel";

/**
 * Interface for the projection.
 */
// tag::PiProjection[]
export interface PiProjection {
    /**
     * returns the box for `element`.
     */
    getBox(element: PiElement): Box;
}
// end::PiProjection[]
