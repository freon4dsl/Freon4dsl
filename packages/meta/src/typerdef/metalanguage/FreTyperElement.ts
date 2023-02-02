import { FreDefinitionElement } from "../../utils";

export class FreTyperElement extends FreDefinitionElement {
    owner: FreTyperElement;
    readonly $typename: string = "FreTyperElement";
}
