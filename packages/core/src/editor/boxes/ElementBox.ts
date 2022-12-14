import { makeObservable, observable } from "mobx";
import { PiElement } from "../../ast/index";
import { Box } from "./Box";
import { EmptyLineBox } from "./EmptyLineBox";

export class ElementBox extends Box {
    kind: string = 'ElementBox';
    private _content: Box = null;

    constructor(element: PiElement, role: string) {
        super(element, role);
    }

    get content() {
        return this._content;
    }

    set content(v: Box) {
        this._content = v;
        v.parent = this;
        this.isDirty();
    }

    get children(): ReadonlyArray<Box> {
        return [this.content];
    }
}

export function isElementBox(b: Box): b is ElementBox {
    return (!!b) && b.kind === "ElementBox"; // b instanceof ElementBox;
}
