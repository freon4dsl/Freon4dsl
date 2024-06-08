import { FreMetaLangElement } from "../../languagedef/metalanguage/index";

export class FreTyperElement extends FreMetaLangElement {
    owner: FreTyperElement;
    readonly $typename: string = "FreTyperElement";
}
