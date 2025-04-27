import { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";
import { Box } from "./Box.js"
import {ClientRectangle} from "../ClientRectangleTypes.js";

export class ElementBox extends Box {
    kind: string = "ElementBox";
    private _content: Box = null;

    refreshComponent = (w?: string) => {
        if (this._content !== undefined && this._content.refreshComponent !== undefined) {
            this._content.refreshComponent(w);
        }
    };

    constructor(element: FreNode, role: string, initializer?: Partial<ElementBox>) {
        super(element, role);
        FreUtils.initializeObject(this, initializer);
    }
    
    get content() {
        return this._content;
    }

    set content(v: Box) {
        if (this._content !== null && this._content !== undefined) {
            this._content.parent = null;
        }
        this._content = v;
        if (!!v) {
            v.parent = this;
        }
        this.isDirty();
    }

    get children(): ReadonlyArray<Box> {
        if (this.content === null || this.content === undefined) {
            return []
        } else {
            return [this.content];
        }
    }

    getClientRectangle = (): ClientRectangle => {
        return this.content.getClientRectangle();
    }
}

export function isElementBox(b: Box): b is ElementBox {
    return !!b && b.kind === "ElementBox"; // b instanceof ElementBox;
}
