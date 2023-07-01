import { FreMetaDefinitionElement } from "../../utils";

export class FreTyperElement extends FreMetaDefinitionElement {
    owner: FreTyperElement;
    readonly $typename: string = "FreTyperElement";
}
