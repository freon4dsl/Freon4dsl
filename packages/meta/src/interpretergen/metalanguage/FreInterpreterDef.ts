import { FreMetaClassifier, FreMetaConcept } from "../../languagedef/metalanguage/index";
import { FreMetaDefinitionElement } from "../../utils/index";

export class FreInterpreterDef extends FreMetaDefinitionElement {
    readonly $typename: string = "FreInterpreterDef";

    conceptsToEvaluate: FreMetaClassifier[] = [];
}
