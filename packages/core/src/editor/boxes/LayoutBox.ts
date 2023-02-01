import { PiUtils } from "../../util";
import { Box} from "./Box";
import { PiElement } from "../../ast";
import { SelectOption } from "./SelectOption";
import { Concept, Language } from "../../language";
import { PiCreatePartAction } from "../actions";
import { PiLogger } from "../../logging";
import { MenuItem } from "../util";

const LOGGER = new PiLogger("LayoutBox");
export enum ListDirection {
    HORIZONTAL = "Horizontal",
    VERTICAL = "Vertical"
}

export abstract class LayoutBox extends Box {
    kind = "LayoutBox";
    protected direction: ListDirection = ListDirection.HORIZONTAL;
    protected _children: Box[] = [];

    protected constructor(element: PiElement, role: string, children?: Box[], initializer?: Partial<LayoutBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach(b => this.addChildNoDirty(b));
        }
        this.selectable = false;
    }

    /**
     * To be used when adding multiple children in one go, avoiding spurious isDirty() calls.
     * @param child
     * @private
     */
    private addChildNoDirty(child: Box | null): LayoutBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
        }
        return this;
    }

    get children(): ReadonlyArray<Box> { // TODO Jos: why the ReadOnlyArray?
        return this._children as ReadonlyArray<Box>;
    }

    replaceChildren(children: Box[]): LayoutBox {
        this._children.forEach(ch => ch.parent = null);
        this._children.splice(0, this._children.length);
        if (!!children) {
            children.forEach((child) => {
                if (!!child) {
                    this._children.push(child);
                    child.parent = this;
                }
            });
        }
        LOGGER.log("Layout replaceChildren dirty " + this.role)
        this.isDirty();
        return this;
    }

    clearChildren(): void {
        const dirty = (this._children.length !== 0);
        this._children.splice(0, this._children.length);
        if (dirty) {
            LOGGER.log("Layout clearChildren dirty " + this.role)
            this.isDirty();
        }
    }

    addChild(child: Box | null): LayoutBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
            LOGGER.log("Layout addChild dirty " + this.role + " child added " + child.id)
            this.isDirty();
        }
        return this;
    }

    insertChild(child: Box | null): LayoutBox {
        if (!!child) {
            this._children.splice(0, 0, child);
            child.parent = this;
            LOGGER.log("Layout insertChild dirty " + this.role + " child inserted " + child.id);
            this.isDirty();
        }
        return this;
    }

    addChildren(children?: Box[]): LayoutBox {
        if (!!children) {
            children.forEach(child => this.addChild(child));
            // LOGGER.log("List addChildren dirty")
            this.isDirty();
        }
        return this;
    }

    nextSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index !== -1) {
            if (index + 1 < this.children.length) {
                return this.children[index + 1];
            }
        }
        return null;
    }

    previousSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index > 0) {
            return this.children[index - 1];
        }
        return null;
    }

    getDirection(): ListDirection {
        return this.direction;
    }

    toString() {
        let result: string = "Layout: " + this.role + " " + this.direction.toString() + "<";
        for (const child of this.children) {
            result += "\n    " + child.toString();
        }
        result += ">";
        return result;
    }

}

export class HorizontalLayoutBox extends LayoutBox {
    kind = "HorizontalLayoutBox";

    constructor(element: PiElement, role: string, children?: (Box | null)[], initializer?: Partial<HorizontalLayoutBox>) {
        super(element, role, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
    }
}

export class VerticalLayoutBox extends LayoutBox {
    kind = "VerticalLayoutBox";

    constructor(element: PiElement, role: string, children?: Box[], initializer?: Partial<HorizontalLayoutBox>) {
        super(element, role, children, initializer);
        this.direction = ListDirection.VERTICAL;
    }
}

export function isHorizontalBox(b: Box): b is HorizontalLayoutBox {
    return b.kind === "HorizontalLayoutBox"; // b instanceof HorizontalLayoutBox;
}

export function isVerticalBox(b: Box): b is VerticalLayoutBox {
    return b.kind === "VerticalLayoutBox"; // b instanceof VerticalLayoutBox;
}

export function isLayoutBox(b: Box): boolean {
    return (b.kind === "HorizontalLayoutBox" || b.kind === "VerticalLayoutBox");
}

