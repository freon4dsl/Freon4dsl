import { Box } from "./Box";
import { EmptyLineBox } from "./EmptyLineBox";

export class ElementBox extends Box {
    content: Box;
    kind: string = 'ElementBox';
}

export function isElementBox(b: Box): b is EmptyLineBox {
    return b.kind === "ElementBox"; // b instanceof ElementBox;
}
