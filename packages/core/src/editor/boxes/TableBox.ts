import { GridBox } from "./GridBox";
import { Box } from "./Box";
import { PiElement } from "../../ast";
import { TableCellBox } from "./TableCellBox";
import { Language } from "../../language";

/**
 * A TableBox is a GridBox that shows a list in the PiElement model. Therefore, we know
 * that every row or column, depending on the orientation, represents a single element in the
 * list.
 */
export class TableBox extends GridBox {
    kind = "TableBox";
    cells: TableCellBox[] = [];
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(element: PiElement, propertyName: string, role: string, cells: TableCellBox[], initializer?: Partial<GridBox>) {
        super(element, role, cells, initializer);
        this.cells = cells; // need to overwrite the parent property, because of the difference in type
        this.propertyName = propertyName;
        // todo check whether the conceptName is correct
        this.conceptName = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
    }
}

export function isTableBox(box: Box): box is TableBox {
    return box.kind === "TableBox"; //  box instanceof TableBox;
}
