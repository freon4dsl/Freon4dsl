import { FreUtils } from "../../util";
import { FreCaret, FreCaretPosition } from "../util";
import { FreNode } from "../../ast";
import { Box } from "./Box";
import { FreLogger } from "../../logging";
import { CharAllowed } from "./CharAllowed";

const LOGGER: FreLogger = new FreLogger("TextBox");

export class ItemGroupBox extends Box {
    kind: string = "ItemGroupBox";

    /**
     * If true, the element will be deleted when the text becomes
     * empty because of removing the last character in the text.
     * Usable for e.g. numeric values.
     */
    deleteWhenEmpty: boolean = false;

    /**
     * If true, delete element when Erase key is pressed while the element is empty.
     */
    deleteWhenEmptyAndErase: boolean = false;

    placeHolder: string = "";
    caretPosition: number = -1;
    $getText: () => string;
    $setText: (newValue: string) => void;
    $label: string = "";
    $level: number = 0;
    $child: Box = null;
    $isExpanded: boolean = false;
    $isDraggable: boolean = true;

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        LOGGER.log("setText to " + newValue);
        this.$setText(newValue);
        this.isDirty();
    }

    getText(): string {
        return this.$getText();
    }

    setLabel(getLabel: string | (() => string)) {
        if (typeof getLabel === "function") {
            if (this.getLabel !== getLabel) {
                this.getLabel = getLabel;
                this.isDirty();
            }
        } else if (typeof getLabel === "string") {
            if (this.$label !== getLabel) {
                this.$label = getLabel;
                this.isDirty();
            }
        } else {
            throw new Error("LabelBox: incorrect label type");
        }
    }

    getLabel(): string {
        return this.$label;
    }

    get child() {
        return this.$child;
    }

    set child(v: Box) {
        this.$child = v;
        this.$child.parent = this;
        this.isDirty();
    }

    isCharAllowed: (currentText: string, key: string, index: number) => CharAllowed = () => {
        return CharAllowed.OK;
    };

    constructor(node: FreNode, role: string, getLabel: string | (() => string), getText: () => string, setText: (text: string) => void, level: number, child: Box, initializer?: Partial<ItemGroupBox>, cssClass?: string, isExpanded?: boolean, isDraggable?: boolean) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getText = getText;
        this.$setText = setText;
        this.setLabel(getLabel);
        this.cssClass = cssClass;
        this.$child = child;
        this.$level = level;
        this.$isExpanded = isExpanded;
        this.$isDraggable = isDraggable;
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }

    // INTERNAL FUNCTIONS

    /** @internal
     */
    setCaret: (caret: FreCaret) => void = (caret: FreCaret) => {
        LOGGER.log("setCaret: " + caret.position);
        /* To be overwritten by `TextComponent` */
        // TODO The followimng is needed to keep the cursor at the end when creating a nu8mberliteral in example
        //     Check in new components whether this is needed.
        switch (caret.position) {
            case FreCaretPosition.RIGHT_MOST:
                this.caretPosition = this.getText().length;
                break;
            case FreCaretPosition.LEFT_MOST:
                this.caretPosition = 0;
                break;
            case FreCaretPosition.INDEX:
                this.caretPosition = caret.position;
                break;
            case FreCaretPosition.UNSPECIFIED:
                break;
            default:
                break;
        }
    };

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `TextComponent` */
    };

    isEditable(): boolean {
        return true;
    }
}

export function isItemGroupBox(b: Box): b is ItemGroupBox {
    return !!b && b.kind === "ItemGroupBox"; // b instanceof ItemGroupBox;
}
