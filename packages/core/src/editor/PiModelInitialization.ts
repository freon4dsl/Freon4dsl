import { PiElement } from "../language/PiModel";

// tag::initialization-interface[]
export interface PiModelInitialization {
    initialize(): PiElement;
}
// end::initialization-interface[]
