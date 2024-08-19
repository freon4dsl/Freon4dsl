import { Box } from "./Box";
import { FreNode } from "../../ast";
import { FreUtils } from "../../util";
// todo factor out the methods common with GridBox and ListBox

export enum TableDirection {
    HORIZONTAL = "Row",
    VERTICAL = "Column",
}

/**
 * A TableBox shows a list in the FreElement model as table. Therefore, we know
 * that every row or column, depending on the orientation, represents a single element in the
 * list.
 */
export abstract class TableBox extends Box {
    protected _direction: TableDirection = TableDirection.HORIZONTAL;
    protected _children: Box[] = [];
    public hasHeaders: boolean = false;
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    protected constructor(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        hasHeaders: boolean,
        children?: Box[],
        initializer?: Partial<TableBoxRowOriented>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach((b) => this.addChild(b));
        }
        this.hasHeaders = hasHeaders;
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this.selectable = false;
    }

    get direction(): TableDirection {
        return this._direction;
    }

    numberOfRows(): number {
        return 0;
    }

    numberOfColumns(): number {
        return 0;
    }

    get children(): Box[] {
        return this._children;
    }

    replaceChildren(children: Box[]): TableBox {
        this._children.splice(0, this._children.length);
        if (!!children) {
            children.forEach((child) => {
                if (!!child) {
                    this._children.push(child);
                    child.parent = this;
                }
            });
        }
        // console.log("TableBox replaceChildren dirty " + this.role)
        this.isDirty();
        return this;
    }

    clearChildren(): void {
        this._children.forEach((ch) => (ch.parent = null));
        const dirty: boolean = this._children.length !== 0;
        this._children.splice(0, this._children.length);
        if (dirty) {
            // console.log("TableBox clearChildren dirty " + this.role)
            this.isDirty();
        }
    }

    addChild(child: Box | null): TableBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
            // console.log("TableBox addChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    insertChild(child: Box | null): TableBox {
        if (!!child) {
            this._children.splice(0, 0, child);
            child.parent = this;
            // console.log("TableBox insertChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    addChildren(children?: Box[]): TableBox {
        if (!!children) {
            children.forEach((child) => this.addChild(child));
            // console.log("TableBox addChildren dirty")
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

    toString() {
        let result: string = "List: " + this.role + " " + this._direction.toString() + "<";
        for (const child of this.children) {
            result += "\n    " + child.toString();
        }
        result += ">";
        return result;
    }
}

export class TableBoxRowOriented extends TableBox {
    kind = "TableBoxRowOriented";

    constructor(
        element: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        hasHeaders: boolean,
        children?: (Box | null)[],
        initializer?: Partial<TableBoxRowOriented>,
    ) {
        super(element, propertyName, conceptName, role, hasHeaders, children, initializer);
        this._direction = TableDirection.HORIZONTAL;
    }
}

export class TableBoxColumnOriented extends TableBox {
    kind = "TableBoxColumnOriented";

    constructor(
        element: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        hasHeaders: boolean,
        children?: Box[],
        initializer?: Partial<TableBoxRowOriented>,
    ) {
        super(element, propertyName, conceptName, role, hasHeaders, children, initializer);
        this._direction = TableDirection.VERTICAL;
    }
}

export function isTableBoxRowOrientedBox(b: Box): b is TableBoxRowOriented {
    return b?.kind === "TableBoxRowOriented";
}

export function isTableBoxColumnOrientedBox(b: Box): b is TableBoxColumnOriented {
    return b?.kind === "TableBoxColumnOriented";
}

export function isTableBox(box: Box): box is TableBox {
    return isTableBoxRowOrientedBox(box) || isTableBoxColumnOrientedBox(box);
}
