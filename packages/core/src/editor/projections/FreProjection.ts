import { PiElement } from "../../ast";
import { Box } from "../boxes";

/**
 * Interface for a custom projection.
 */
export interface FreProjection {
    // todo add priority
    name: string;
    nodeTypeToBoxMethod: Map<string, (node: PiElement) => Box>;
}
