import { FreMetaLangElement } from "../../languagedef/metalanguage/index";
import { FreMetaDefinitionElement } from "../../utils";

export class FreTyperElement extends FreMetaLangElement {
    owner: FreTyperElement;
    readonly $typename: string = "FreTyperElement";
}
