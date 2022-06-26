import { observable, makeObservable } from "mobx";

import { PiElement } from "../../ast";
import { PiUtils } from "../../util";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("Box");

export abstract class Box {
    $id: string;
    kind: string = "";
    role: string = "";
    roleNumber: number = undefined;
    element: PiElement = null;
    cssClass: string = "";
    cssStyle: string = "";
    selectable: boolean = true;
    parent: Box = null;

    // Never set these manually,  these properties are set after rendering to get the
    // actual coordinates as rendered in the browser,
    actualX: number = -1;
    actualY: number = -1;
    actualWidth: number = -1;
    actualHeight: number = -1;

    constructor(element: PiElement, role: string) {
        // ProUtil.CHECK(!!element, "Element cannot be empty in Box constructor");
        this.element = element;
        this.role = role;
        this.$id = PiUtils.ID(); //uuid.v4();
        makeObservable(this, {
            role: observable,
            roleNumber: observable,
            element: observable,
            cssStyle: observable,
            cssClass: observable
            // actualHeight: observable,
            // actualWidth: observable,
            // actualX: observable,
            // actualY: observable
        })
    }

    get id(): string {
        if (!!this.element) {
            return this.element.piId() + (this.role === null ? "" : "-" + this.role);
        } else {
            return "=" + this.role;
        }
    }

    get root(): Box {
        let result: Box = this;
        while (result.parent) {
            result = result.parent;
        }
        return result;
    }

    get children(): ReadonlyArray<Box> {
        return [];
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (this.isLeaf() && this.selectable) {
            return this;
        }

        for (const child of this.children) {
            const leafChild = child.firstLeaf;
            if (!!leafChild) {
                return leafChild;
            }
        }
        return null;
    }

    isLeaf(): boolean {
        return this.children.length === 0;
    }

    /**
     * Get the last selectable leaf box in the tree with `this` as root.
     */
    get lastLeaf(): Box {
        if (this.isLeaf() && this.selectable) {
            return this;
        }
        const childrenReversed = this.children.filter(ch => true).reverse();
        for (const child of childrenReversed) {
            const leafChild = child.lastLeaf;
            if (!!leafChild) {
                return leafChild;
            }
        }
        return null;
    }

    /**
     * Return the previous selectable leaf in the tree.
     */
    get nextLeafRight(): Box {
        if (!this.parent) {
            return null;
        }
        const thisIndex = this.parent.children.indexOf(this);
        const rightSiblings = this.parent.children.slice(thisIndex + 1, this.parent.children.length);
        for (const sibling of rightSiblings) {
            const siblingChild = sibling.firstLeaf;
            if (!!siblingChild) {
                return siblingChild;
            }
            if (sibling.isLeaf() && sibling.selectable) {
                return sibling;
            }
        }
        return this.parent.nextLeafRight;
    }

    /**
     * Return the next selectable leaf in the tree.
     */
    get nextLeafLeft(): Box {
        if (!this.parent) {
            return null;
        }
        const thisIndex = this.parent.children.indexOf(this);
        const leftSiblings = this.parent.children.slice(0, thisIndex).reverse();
        for (const sibling of leftSiblings) {
            const siblingChild = sibling.lastLeaf;
            if (!!siblingChild) {
                return siblingChild;
            }
            if (sibling.isLeaf() && sibling.selectable) {
                return sibling;
            }
        }
        return this.parent.nextLeafLeft;
    }

    toString() {
        return "[[" + this.id + "]]";
    }

    /**
     * Find the first box with role = `id`.
     */
    find(id: string): Box | null {
        if (this.id === id) {
            return this;
        }

        for (const b of this.children) {
            const result = b.find(id);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }

    /**
     * Find first box for element with `piId()` equals elementId and with `role` inside `this`
     * and all of its children recursively.
     * @param role
     */
    findBox(elementId: string, role?: string): Box {
        if (!!this.element && this.element.piId() === elementId) {
            if (role !== null && role !== undefined) {
                if (this.role === role) {
                    return this;
                }
            } else {
                return this;
            }
        }

        for (const box of this.children) {
            const result = box.findBox(elementId, role);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }

    /** @internal
     * This function is called to set the focus on this element.
     */
    setFocus: () => void = async () => {
        console.error(this.kind + ":setFocus not implemented for " + this.id + " id " + this.$id);
        /* To be overwritten by `TextComponent` */
    };

    /**
     * Get the first editable leaf box in the tree with `this` as root.
     */
    get firstEditableChild(): Box {
        const editableChildren = this.getEditableChildren();
        if (editableChildren.length > 0) {
            return editableChildren[0];
        } else {
            return this;
        }
    }

    private getEditableChildren(): Box[] {
        const result: Box[] = [];
        this.getEditableChildrenRecursive(result);
        return result;
    }

    private getEditableChildrenRecursive(result: Box[]) {
        LOGGER.info(this, "getEditableChildrenRecursive for " + this.kind);
        if (this.isEditable()) {
            LOGGER.info(this, "Found editable: " + this.role);
            result.push(this);
            return;
        }
        this.children.forEach(c => {
            LOGGER.info(this, "child: " + c.kind);
            c.getEditableChildrenRecursive(result);
        });
        // return this.children.filter(c => (isTextBox(c) || isAliasBox(c) || isSelectBox(c)) || c.children.length);
    }

    isEditable(): boolean {
        return false;
    }
}
