import { Box } from "./Box";
import { FreUtils } from "../../util";
import { FreNode } from "../../ast";

export class GroupBox extends Box {
    readonly kind = "GroupBox";
    
    private $label: string = "";
    private $level: number = 0;
    private $child: Box = null;
    
    constructor(node: FreNode, role: string, getLabel: string | (() => string), getLevel: number | (() => number), child: Box, initializer?: Partial<GroupBox>, cssClass?: string) {
        super(node, role);
        this.selectable = false; // default
        FreUtils.initializeObject(this, initializer);
        this.setLabel(getLabel);
        this.setLevel(getLevel);
        this.child = child;
        this.cssClass = cssClass;
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
            throw new Error("GroupBox: incorrect label type");
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
            throw new Error("GroupBox: incorrect level type");
        }
    }

    getLevel(): number {
        return this.$level;
    }

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
    
export function isGroupBox(b: Box): b is GroupBox {
    return b?.kind === "GroupBox"; // b instanceof GroupBox;
}
