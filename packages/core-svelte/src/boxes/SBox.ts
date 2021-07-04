import type { PiElement } from "@projectit/core";

export abstract class SBox {
    id: string;
    kind: string;

    element: PiElement;
}
