import { Box } from "./Box";
import { FreUtils } from "../../util";
import { FreNode } from "../../ast";

export class ListGroupBox extends Box {
    readonly kind = "ListGroupBox";
    
    private $label: string = "";
    private $level: number = 0;
    private $child: Box = null;
    
    constructor(node: FreNode, role: string, getLabel: string | (() => string), getLevel: number | (() => number), child: Box, initializer?: Partial<ListGroupBox>, cssClass?: string, isExpanded?: boolean) {
        super(node, role);
        this.selectable = false; // default
        FreUtils.initializeObject(this, initializer);
        this.setLabel(getLabel);
        this.setLevel(getLevel);
        this.child = child;
        this.cssClass = cssClass;
        if (isExpanded === undefined) {
            this.isExpanded = false;
        } else {
            this.isExpanded = isExpanded;
        }      
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
            throw new Error("ListGroupBox: incorrect label type");
        }
    }

    getLabel(): string {
        return this.$label;
    }
  
    setLevel(getLevel: number | (() => number)) {
        if (typeof getLevel === "function") {
            if (this.getLevel !== getLevel) {
                this.getLevel = getLevel;
                this.isDirty();
            }
        } else if (typeof getLevel === "number") {
            if (this.$level !== getLevel) {
                this.$level = getLevel;
                this.isDirty();
            }
        } else {
            throw new Error("ListGroupBox: incorrect level type");
        }
    }

    getLevel(): number {
        return this.$level;
    }
    
    isExpanded: boolean;

    get child() {
        return this.$child;
    }

    set child(v: Box) {
        this.$child = v;
        this.$child.parent = this;
        this.isDirty();
    }

    get firstLeaf(): Box {
        return this.child.firstLeaf;
    }

    get lastLeaf(): Box {
        return this.child.lastLeaf;
    }

    get firstEditableChild(): Box {
        return this.child.firstEditableChild;
    }

    get children(): ReadonlyArray<Box> {
        return [this.child];
    }  
} 
    
export function isListGroupBox(b: Box): b is ListGroupBox {
    return b?.kind === "ListGroupBox"; // b instanceof ListGroupBox;
}
