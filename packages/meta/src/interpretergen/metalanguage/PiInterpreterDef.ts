import { PiConcept } from "../../languagedef/metalanguage/index";
import { PiDefinitionElement } from "../../utils/index";

export class PiInterpreterDef extends PiDefinitionElement {
    readonly $typename: string = "PiInterpreterDef";

    // TODO Implement the following by definging an interpreted def file.
    conceptsToEvaluate: PiConcept[] = [];

    runtimeType: string = "RtObject";
    astType: string = "PiElement";
}
