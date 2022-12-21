import { PiElement } from "../../ast/index";
import { Box } from "./Box";

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
        if (!!(this?._content)) {
            this._content.parent = null;
        }
        this._content = v;
        if (!!v) {
            v.parent = this;
        }
        this.isDirty();
    }

    get children(): ReadonlyArray<Box> {
        return [this.content];
    }

    setFocus: () => void = async () => {
        this._content.setFocus();
    };
}

export function isElementBox(b: Box): b is ElementBox {
    return (!!b) && b.kind === "ElementBox"; // b instanceof ElementBox;
}
