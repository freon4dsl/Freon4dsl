import { PiDefinitionElement } from "../../utils";

export class PiTyperElement extends PiDefinitionElement {
    owner: PiTyperElement;
    readonly $typename: string = "PiTyperElement";
}
