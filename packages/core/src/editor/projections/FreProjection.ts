import { FreNode } from "../../ast";
import { Box } from "../boxes";
import { FreTableDefinition } from "../FreTableDefinition";

/**
 * Interface for a custom projection.
 */
export interface FreProjection {
    // todo add priority

    // Name of the custom projection
    name: string;

    // A map from the name of the concept (or the freLanguageConcept() of the FreElement node) to
    // the function that may return the custom box for a node of that type.
    nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box>;

    // A map from the name of the concept (or the freLanguageConcept() of the FreElement node) to
    // the function that may return the custom box for a node of that type.
    nodeTypeToTableDefinition: Map<string, () => FreTableDefinition>; // todo change name and remove Tabledefinition type
}
