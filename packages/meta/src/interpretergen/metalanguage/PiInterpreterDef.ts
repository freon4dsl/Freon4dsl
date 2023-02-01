import { PiConcept } from "../../languagedef/metalanguage/index";
import { PiDefinitionElement } from "../../utils/index";

export class PiInterpreterDef extends PiDefinitionElement{
    readonly $typename: string = "PiInterpreterDef";

    conceptsToEvaluate: PiConcept[] = [];
}
