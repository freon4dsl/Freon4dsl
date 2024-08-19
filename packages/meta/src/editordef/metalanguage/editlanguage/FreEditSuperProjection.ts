import { FreMetaDefinitionElement } from "../../../utils/index.js";
import { FreMetaClassifier, MetaElementReference } from "../../../languagedef/metalanguage/index.js";

/**
 * An element of a line in a projection definition that represents the projection of a superconcept or interface.
 */
export class FreEditSuperProjection extends FreMetaDefinitionElement {
    superRef?: MetaElementReference<FreMetaClassifier> = undefined;
    projectionName: string = "";
    toString(): string {
        return `[=> ${this.superRef?.name} /* found ${this.superRef?.referred?.name} */ ${this.projectionName.length > 0 ? `:${this.projectionName}` : ``}]`;
    }
}
