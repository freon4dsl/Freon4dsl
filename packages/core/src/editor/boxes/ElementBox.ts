import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast/index";
import { Box } from "./Box";
import { EmptyLineBox } from "./EmptyLineBox";

export class ElementBox extends Box {
    kind: string = 'ElementBox';
    _content: Box = null;
    dirty: () => void;

    constructor(element: PiElement, role: string) {
        super(element, role);
        // makeObservable(this, {
        //     content: observable
        // });
    }

    get content() {
        return this._content;
    }
    
    set content(v: Box) {
        this._content = v;
        if (!!this.dirty) {
            this.dirty();
        }
    }
    
    get children(): ReadonlyArray<Box> {
        return [this.content];
    }
}

export function isElementBox(b: Box): b is EmptyLineBox {
    return b.kind === "ElementBox"; // b instanceof ElementBox;
}
