import { PiElement } from "../../ast";
import { Box } from "../boxes";
// import { PiTableDefinition } from "../PiTables";

/**
 * Interface for a custom projection.
 */
export interface FreProjection {
    // todo add priority
    name: string;
    nodeTypeToBoxMethod: Map<string, (node: PiElement) => Box>;
    // todo add nodeTypeToTableDefinition: Map<string, (nodeType: string) => PiTableDefinition>;
}
