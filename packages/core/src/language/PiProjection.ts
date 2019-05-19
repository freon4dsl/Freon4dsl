import { Box } from "../boxes";
import { PiElement } from "./PiModel";

/**
 * Interface for the projection.
 */
export interface PiProjection {
  /**
   * returns the box for `element`.
   */
  getBox(element: PiElement): Box;
}
