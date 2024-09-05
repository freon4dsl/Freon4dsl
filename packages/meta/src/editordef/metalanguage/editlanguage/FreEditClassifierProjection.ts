import { FreMetaDefinitionElement } from "../../../utils/index.js";
import { FreMetaClassifier, MetaElementReference } from "../../../languagedef/metalanguage/index.js";
import { FreEditFragmentDefinition, FreEditExternalInfo, FreEditPropertyProjection } from "./internal.js";
import { FreEditFragmentProjection } from "./FreEditFragmentProjection.js";

/**
 * A single projection definition for a single concept or interface
 */
export abstract class FreEditClassifierProjection extends FreMetaDefinitionElement {
    name: string = "";
    classifier: MetaElementReference<FreMetaClassifier> | undefined;
    fragmentDefinitions: FreEditFragmentDefinition[] = [];

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): FreEditPropertyProjection[] {
        console.error(
            `FreEditClassifierProjection.findAllPartProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`,
        );
        return [];
    }

    /**
     * Returns all fragment projections including those in fragment definitions.
     */
    findAllFragmentProjections(): FreEditFragmentProjection[] {
        console.error(
            `FreEditClassifierProjection.findAllFragmentProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`,
        );
        return [];
    }

    toString(): string {
        return `TO BE IMPLEMENTED BY SUBCLASSES`;
    }

    findAllExternals(): FreEditExternalInfo[] {
        console.error(
            `FreEditClassifierProjection.findPositionsOfExternal() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`,
        );
        return [];
    }

    getUsedFragmentNames(): string[] {
        return this.findAllFragmentProjections().map((fr) => fr.name);
    }

    /**
     * Returns only the fragment projections in the 'main' projection.
     */
    findMainFragmentProjections(): FreEditFragmentProjection[] {
        console.error(
            `FreEditClassifierProjection.findMainFragmentProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`,
        );
        return [];
    }
}
