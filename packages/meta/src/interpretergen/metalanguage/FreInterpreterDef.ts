import { FreMetaClassifier } from "../../languagedef/metalanguage/index.js";
import { FreMetaDefinitionElement } from "../../utils/index.js";

export class FreInterpreterDef extends FreMetaDefinitionElement {
    readonly $typename: string = "FreInterpreterDef";

    conceptsToEvaluate: FreMetaClassifier[] = [];
}
