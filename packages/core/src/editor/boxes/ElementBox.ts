import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast/index";
import { Box } from "./Box";
import { EmptyLineBox } from "./EmptyLineBox";

export class ElementBox extends Box {
    kind: string = 'ElementBox';
    content: Box = null;
    
    constructor(element: PiElement, role: string) {
        super(element, role);
        makeObservable(this, {
            content: observable
        })
    }
}

export function isElementBox(b: Box): b is EmptyLineBox {
    return b.kind === "ElementBox"; // b instanceof ElementBox;
}
