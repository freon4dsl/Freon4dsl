import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreMetaClassifier, MetaElementReference} from "../../../languagedef/metalanguage/index.js";
import {FreEditExternalChildDefinition, FreEditExternalInfo, FreEditPropertyProjection} from "./internal.js";

/**
 * A single projection definition for a single concept or interface
 */
export abstract class FreEditClassifierProjection extends FreMetaDefinitionElement {
    name: string = '';
    classifier: MetaElementReference<FreMetaClassifier> | undefined;
    externalChildDefs: FreEditExternalChildDefinition[] = [];

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): FreEditPropertyProjection[] {
        console.error(`FreEditClassifierProjection.findAllPartProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`);
        return [];
    }

    /**
     * Returns the 'positionInProjection' part of an expression like 'SMUI_Card:Second' (i.e. 'Second')
     * for all occurrences of external projections or property projections that are marked 'external',
     * and have the name 'externalName'.
     * @param externalName
     */
    // @ts-ignore the param is used by subclasses that implement this function
    findPositionsOfExternal(externalName: string): string[] {
        console.error(`FreEditClassifierProjection.findPositionsOfExternal() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`);
        return [];
    }

    toString(): string {
        return `TO BE IMPLEMENTED BY SUBCLASSES`;
    }

    findAllExternals(): FreEditExternalInfo[] {
        console.error(`FreEditClassifierProjection.findPositionsOfExternal() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`);
        return [];
    }
}
