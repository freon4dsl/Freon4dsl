import { GridCellBox } from "./GridCellBox";
import { PiElement } from "../../ast";
import { Box } from "./Box";
import { Language } from "../../language";
import { getContextMenuOptions, MenuItem, MenuOptionsType } from "../util";

export class TableCellBox extends GridCellBox {
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(element: PiElement, propertyName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<TableCellBox>) {
        super(element, role, row, column, box, initializer);
        this.propertyName = propertyName;

        this.conceptName = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
        if (!this.conceptName) { // try the parent
            this.conceptName = Language.getInstance().classifierProperty(element.piOwner().piLanguageConcept(), propertyName)?.type;
        }
    }

    options(type: MenuOptionsType): MenuItem[] {
        return getContextMenuOptions(this.conceptName, this.element, this.propertyName, type);
    }
}
