import { PiElement } from "../../ast";
import { Box, TableRowBox } from "../boxes";
import { PiTableDefinition } from "../PiTables";

/**
 * Interface for a custom projection.
 */
export interface FreProjection {
    // todo add priority

    // Name of the custom projection
    name: string;

    // A map from the name of the concept (or the piLanguageConcept() of the PiElement node) to
    // the function that may return the custom box for a node of that type.
    nodeTypeToBoxMethod: Map<string, (node: PiElement) => Box>;

    // A map from the name of the concept (or the piLanguageConcept() of the PiElement node) to
    // the function that may return the custom box for a node of that type.
    nodeTypeToTableDefinition: Map<string, () => PiTableDefinition>; // todo change name and remove Tabledefintion type
}
