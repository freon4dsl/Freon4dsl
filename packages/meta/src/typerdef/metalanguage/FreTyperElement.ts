import { FreMetaLangElement } from "../../languagedef/metalanguage/index";

export class FreTyperElement extends FreMetaLangElement {
    // @ts-ignore Property is set during parsing and checking phases
    owner: FreTyperElement;
    readonly $typename: string = "FreTyperElement";
}
