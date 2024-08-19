import { FreNode } from "../../ast";
import { isNullOrUndefined, FreUtils, FRE_BINARY_EXPRESSION_LEFT, FRE_BINARY_EXPRESSION_RIGHT } from "../../util";
import { FreLogger } from "../../logging";

const LOGGER = new FreLogger("Box");

/**
 * The root of the Box class hierarchy, contains all generic properties and a number of navigation/search functions.
 */
export abstract class Box {
    $id: string;
    kind: string = "";
    role: string = "";
    node: FreNode = null; // the model element to which this box is coupled
    propertyName: string; // the name of the property, if any, in 'element' which this box projects
    propertyIndex: number; // the index within the property, if appropriate
    // todo make sure propertyName and index are correctly set

    cssClass: string = ""; // Custom CSS class that will be added to the component rendering this box
    cssStyle: string = ""; // Custom CSS Style class that will be added as inline style to the component rendering this box
    selectable: boolean = true; // Can this box be selected in the editor?
    // todo because most boxes are not selectable the default could be set to false
    isVisible: boolean = true; // Is this box currently not shown in the editor?
    parent: Box = null;

    refreshComponent: (why?: string) => void; // The refresh method from the component that displays this box.

    /**
     *  Called when the box is dirty, refreshes the corresponding component.
     */
    isDirty(): void {
        if (this.refreshComponent !== undefined && this.refreshComponent !== null) {
            this.refreshComponent("Called by Box " + this.kind + " " + this.id);
        } else {
            LOGGER.log("No refreshComponent() for " + this.role);
        }
    }

    // Never set these manually, these properties are set after rendering to get the
    // actual coordinates as rendered in the browser,
    // TODO see whether these can be set on demand and whether this is useful ??? Probably yes.
    actualX: number = -1;
    actualY: number = -1;
    actualWidth: number = -1;
    actualHeight: number = -1;

    protected constructor(node: FreNode, role: string) {
        FreUtils.CHECK(!!node, "Element cannot be empty in Box constructor");
        this.node = node;
        this.role = role;
        this.$id = FreUtils.BOX_ID(); // uuid.v4();
    }

    get id(): string {
        if (!!this.node) {
            return this.node.freId() + (this.role === null ? "" : "-" + this.role);
        } else {
            return "unknown-element-" + this.role;
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
    get firstLeaf(): Box | null {
        if (!this.isVisible) {
            return null;
        }
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
    get lastLeaf(): Box | null {
        if (!this.isVisible) {
            return null;
        }
        if (this.isLeaf() && this.selectable) {
            return this;
        }
        // TODO Why filter or concat here?
        // const childrenReversed = this.children.filter(ch => true).reverse();
        const childrenReversed = this.children.concat().reverse();
        for (const child of childrenReversed) {
            const leafChild: Box = child.lastLeaf;
            if (!!leafChild) {
                return leafChild;
            }
        }
        return null;
    }

    // TODO change name into nextSelectableLeafRight or something similar?
    /**
     * Return the previous selectable leaf in the tree.
     */
    get nextLeafRight(): Box | null {
        if (!this.parent) {
            return null;
        }
        const thisIndex: number = this.parent.children.indexOf(this);
        const rightSiblings: Box[] = this.parent.children.slice(thisIndex + 1, this.parent.children.length);
        for (const sibling of rightSiblings) {
            const siblingChild: Box = sibling.firstLeaf;
            if (!!siblingChild) {
                return siblingChild;
            }
            if (sibling.isLeaf() && sibling.selectable && sibling.isVisible) {
                return sibling;
            }
        }
        return this.parent.nextLeafRight;
    }

    // TODO change name into nextSelectableLeafLeft or something similar?
    /**
     * Return the next selectable leaf in the tree.
     */
    get nextLeafLeft(): Box | null {
        if (this.parent === null || this.parent === undefined) {
            return null;
        }
        const thisIndex: number = this.parent.children.indexOf(this);
        const leftSiblings: Box[] = this.parent.children.slice(0, thisIndex).reverse();
        for (const sibling of leftSiblings) {
            const siblingChild: Box = sibling.lastLeaf;
            if (!!siblingChild) {
                return siblingChild;
            }
            if (sibling.isLeaf() && sibling.selectable && sibling.isVisible) {
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
     * Find the first box with role = `role`.
     */
    findBoxWithRole(role: string): Box | null {
        if (this.role === role) {
            return this;
        }

        for (const b of this.children) {
            const result = b.findBoxWithRole(role);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
    /**
     * Find first box for element with `freId()` equals elementId and with `role` inside `this`
     * and all of its children recursively.
     * @param propertyName
     */
    // findBox(elementId: string, propertyName?: string, propertyIndex?: number): Box {
    //     if (!isNullOrUndefined(this.element) && this.element.freId() === elementId) {
    //         if (!isNullOrUndefined(propertyName)) {
    //             if (!isNullOrUndefined(propertyIndex)) {
    //                 if (this.propertyName === propertyName && this.propertyIndex === propertyIndex) {
    //                     return this;
    //                 }
    //             } else {
    //                 if (this.propertyName === propertyName) {
    //                     return this;
    //                 }
    //             }
    //         } else {
    //             return this;
    //         }
    //     }
    //
    //     for (const box of this.children) {
    //         const result = box.findBox(elementId, propertyName, propertyIndex);
    //         if (result !== null) {
    //             return result;
    //         }
    //     }
    //     return null;
    // }

    // TODO Needs element as parameter otherwise any property of any element can be found.
    //      For thee same reason, recursively searching children should only be done if the child has the same element.
    /**
     * Searches within the children of this box for a box that represents the property
     * with requested name and index. If not found it returns null.
     * @param propertyName
     * @param propertyIndex
     */
    findChildBoxForProperty(propertyName?: string, propertyIndex?: number): Box | null {
        // if (propertyName === "value" && propertyIndex === undefined) {
        console.log("findChildBoxForProperty " + this.role + "[" + propertyName + ", " + propertyIndex + "]");
        // }
        for (const child of this.children) {
            // console.log('===> child: [' + child.propertyName + ", " + child.propertyIndex + "]")
            if (!isNullOrUndefined(propertyName)) {
                if (!isNullOrUndefined(propertyIndex)) {
                    if (child.propertyName === propertyName && child.propertyIndex === propertyIndex) {
                        return child;
                    }
                } else {
                    if (child.propertyName === propertyName) {
                        // console.log('returning child box ' + child.role);
                        return child;
                    }
                }
            } else {
                return child;
            }
            const result = child.findChildBoxForProperty(propertyName, propertyIndex);
            if (!isNullOrUndefined(result) && result.node === this.node) {
                return result;
            }
        }
        // console.log('not found!!!');
        return null;
    }

    /**
     * This function is called to set the focus on this element programmatically. Because of
     * asynchronicity and both mobx and svelte reactivity, this is done as follows.
     * 1. The box model is changed as requested by the user or programmatically.
     * 2. The 'editor.selectedBox' attribute gets a new value.
     * 3. The RenderComponent determines which of the shown boxes needs the focus, based
     * on 'editor.selectedBox', and the setFocus() method of this box is called.
     * 4. In various boxes the setFocus() method is overwritten by the Svelte component that
     * shows the box. Thus, the correct handling of the focus is done by this Svelte component.
     * 5. If this box does not have a component, i.e. it is not shown in the current projection
     * AND this method is not overridden, then the focus will be set to the parent box.
     */
    setFocus: () => void = async () => {
        console.log(
            this.kind + ":setFocus not implemented for " + this.id + " id " + this.$id + ", referring to parent",
        );
        this.parent?.setFocus();
    };

    /**
     * Get the first editable leaf box in the tree with `this` as root.
     */
    get firstEditableChild(): Box | null {
        const editableChildren: Box[] = [];
        this.getEditableChildrenRecursive(editableChildren);
        if (editableChildren.length > 0) {
            // Prefer a left- or right-placeholder if possible
            const binaryPlaceHolders: Box[] = editableChildren.filter(
                (box) => box.role === FRE_BINARY_EXPRESSION_LEFT || box.role === FRE_BINARY_EXPRESSION_RIGHT,
            );
            return binaryPlaceHolders.length > 0 ? binaryPlaceHolders[0] : editableChildren[0];
        } else {
            return this;
        }
    }

    // TODO This will find all editable children, but not editable children of an editable child.
    //      Looking at the usage, we only need the first editable child, so maybe this could be simplified.
    private getEditableChildrenRecursive(result: Box[]) {
        LOGGER.info("getEditableChildrenRecursive for " + this.kind);
        if (this.isEditable()) {
            LOGGER.info("Found editable: " + this.role);
            result.push(this);
            return;
        }
        this.children.forEach((c) => {
            LOGGER.info("child: " + c.kind);
            c.getEditableChildrenRecursive(result);
        });
        // return this.children.filter(c => (isTextBox(c) || isActionBox(c) || isSelectBox(c)) || c.children.length);
    }

    isEditable(): boolean {
        return false;
    }
}
