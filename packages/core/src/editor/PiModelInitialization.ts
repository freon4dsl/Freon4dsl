import { PiElement } from "../language/PiModel";

// tag::initialization-interface[]
export interface PiModelInitialization {
    initialize(): PiElement;

    newUnit(model: PiElement, unitTypeName: string): PiElement;
}
// end::initialization-interface[]
