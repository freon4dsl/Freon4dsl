import { observable } from "mobx";
import * as uuid from "uuid";

import { PiElement } from "../../language/PiModel";
import { PiLogger } from "../../util/PiLogging";

const LOGGER = new PiLogger("Box"); // .mute();

export abstract class Box {
    $id: string;
    kind: string;
    @observable role: string;
    @observable roleNumber: number = undefined;
    @observable element: PiElement;
    @observable style: string;
    selectable: boolean = true;
    parent: Box = null;

    // Never set these manually,  these properties are set after rendering to get the
    // actual coordinates as rendered in the browser,
    @observable actualX: number = -1;
    @observable actualY: number = -1;
    @observable actualWidth: number = -1;
    @observable actualHeight: number = -1;

    constructor(element: PiElement, role: string) {
        // ProUtil.CHECK(!!element, "Element cannot be empty in Box constructor");
        this.element = element;
        this.role = role;
        this.$id = uuid.v4();
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
        const selectable = this.getSelectableChildren();
        if (selectable.length > 0) {
            return selectable[0].firstLeaf;
        } else {
            return this;
        }
    }

    /**
     * Get the last selectable leaf box in the tree with `this` as root.
     */
    get lastLeaf(): Box {
        const selectable = this.getSelectableChildren();
        if (selectable.length > 0) {
            return selectable[selectable.length - 1].lastLeaf;
        } else {
            return this;
        }
    }

    // TODO Recursively look into siblings children
    get nextLeafRight(): Box {
        if (!this.parent) {
            return null;
        }
        const selectable = this.getSelectableSiblings();
        const thisIndex = selectable.indexOf(this);
        if (thisIndex < selectable.length - 1) {
            return selectable[thisIndex + 1].firstLeaf;
        } else {
            return this.parent.nextLeafRight;
        }
    }

    // TODO Recursively look into siblings children
    get nextLeafLeft(): Box {
        if (!this.parent) {
            return null;
        }
        const selectableSiblings = this.getSelectableSiblings();
        const thisIndex = selectableSiblings.indexOf(this);
        if (thisIndex > 0) {
            return selectableSiblings[thisIndex - 1].lastLeaf;
        } else {
            return this.parent.nextLeafLeft;
        }
    }

    private getSelectableChildren(): Box[] {
        let result = this.children.filter(c => c.selectable);
        // TODO Make this recurive
        // this.children.forEach(child =>
        //     result = result.concat(child.getSelectableChildren()));
        return result;
    }

    private getSelectableSiblings(): Box[] {
        if (this.parent) {
            return this.parent.children.filter(c => c.selectable);
        } else {
            return [];
        }
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
     * Find first box for element with `proId()` equals elementId and with `role` inside `this`
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

    setSetFocus(func: () => void) {
        // LOGGER.info(this, "setSetFocus set for  "+ this.id+ " id " + this.$id );
        this.setFocus = func;
    }

    /** @internal
     * This function is called to set the focus on this element.
     */
    setFocus: () => void = async () => {
        LOGGER.info(this, "setFocus not set for " + this.id + " id " + this.$id);
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
        let result: Box[] = [];
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
