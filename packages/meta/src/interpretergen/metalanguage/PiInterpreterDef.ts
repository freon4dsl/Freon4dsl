import { FreConcept } from "../../languagedef/metalanguage/index";
import { FreDefinitionElement } from "../../utils/index";

export class PiInterpreterDef extends FreDefinitionElement{
    readonly $typename: string = "PiInterpreterDef";

    conceptsToEvaluate: FreConcept[] = [];
}
