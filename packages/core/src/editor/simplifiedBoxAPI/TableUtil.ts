import {
    AliasBox,
    Box,
    HorizontalListBox,
    LabelBox,
    GridBox,
    GridCell,
    KeyboardShortcutBehavior,
    PiEditor, PiStyle, styleToCSS, TextBox, BoxUtils
} from "../index";
import { PiElement } from "../../language";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { MetaKey, PiKey } from "../../util/Keys";
import * as Keys from "../../util/Keys";
import { PiUtils, NBSP } from "../../util";
import { Language } from "../../storage";
import { RoleProvider } from "./RoleProvider";
import { Attribute } from "@projectit/playground/dist/example/language/gen";

// headerStyle and rowStyle are the default styles for a table
export const headerStyle: PiStyle = {
    padding: "0px",
    // color: "darkred",
    "font-weight": "bold",
    "align-items": "left",
    border: "lightgrey",
    // "border-style": "solid",
    // "border-width": "1px",
    "background-color": "lightgrey"
};

export const cellStyle: PiStyle = {
};

export class TableUtil {
    // Note that both tableBoxRowOriented and tableBoxColumnOriented look very similar.
    // They differ in the indexes etc. and can therefore not (easily) be combined.

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a row of the table.
     * A series of getters that each return a Box object must be present: one per column.
     *
     * @param element       The element that holds the list property.
     * @param propertyName  The name of the list property to be shown.
     * @param columnHeaders The titles that are to be shown above each column.
     * @param cellGetters   A series of functions that return the Box to be shown in a cell.
     * @param editor        The editor that should know about KeyboardShortCuts.
     */
    public static tableBoxRowOriented(element: PiElement, propertyName: string, columnHeaders: string[],
                           cellGetters: ((e: PiElement) => Box)[],
                           editor: PiEditor): Box {
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const property = element[propertyName];
        // const isList: boolean = propInfo.isList;
        PiUtils.CHECK(propInfo.isList, `Cannot create a table for property '${element.piLanguageConcept()}.${propertyName}' because it is not a list.`);
        const elementBuilder = Language.getInstance().concept(propInfo.type).constructor;
        // create the box
        if (property !== undefined && property !== null) {
            const cells: GridCell[] = [];
            // add the headers - all in row 1
            columnHeaders.forEach((item: string, index: number) => {
                cells.push({
                    row: 1,
                    column: index + 1,
                    box: BoxUtils.labelBox(element, item),
                    style: headerStyle
                });
            });
            // add the cells for each element of the list
            property.forEach((item: PiElement, rowIndex: number) => {
                cellGetters.forEach((projector, columnIndex) => {
                    const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, rowIndex + 2, columnIndex + 1);
                    cells.push({
                        row: rowIndex + 2,
                        column: columnIndex + 1,
                        box: new HorizontalListBox(item, cellRoleName, [projector(item), new AliasBox(item, "new-" + columnIndex, NBSP)]),
                        style: cellStyle
                    });
                });
            });
            // add an extra row where a new element to the list can be added
            cells.push({
                row: property.length + 3,
                column: 1,
                columnSpan: cellGetters.length,
                box: new AliasBox(element, "alias-add-row", "<add new row>"),
                style: cellStyle
            });
            // Add keyboard actions to grid such that new rows can be added by Return Key
            return this.addKeyBoardShortCuts(element, propertyName, editor, elementBuilder, cells);
        }
        return null;
    }

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a column of the table.
     * A series of getters that each return a Box object must be present: one per row.
     *
     * @param element       The element that holds the list property.
     * @param propertyName  The name of the list property to be shown.
     * @param rowHeaders    The titles that are to be shown before each row.
     * @param cellGetters   A series of functions that return the Box to be shown in a cell.
     * @param editor        The editor that should know about KeyboardShortCuts.
     */
    public static tableBoxColumnOriented(element: PiElement, propertyName: string, rowHeaders: string[],
                                      cellGetters: ((e: PiElement) => Box)[],
                                      editor: PiEditor): Box {
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const property = element[propertyName];
        PiUtils.CHECK(propInfo.isList, `Cannot create a table for property '${element.piLanguageConcept()}.${propertyName}' because it is not a list.`);
        const elementBuilder = Language.getInstance().concept(propInfo.type).constructor;
        // create the box
        if (property !== undefined && property !== null) {
            const cells: GridCell[] = [];
            // add the headers - all in column 1
            rowHeaders.forEach((item: string, index: number) => {
                cells.push({
                    row: index + 1,
                    column: 1,
                    box: BoxUtils.labelBox(element, item),
                    style: headerStyle
                });
            });
            // add the cells for each element of the list
            property.forEach((item: PiElement, columnIndex: number) => {
                cellGetters.forEach((projector, rowIndex) => {
                    const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, rowIndex + 1, columnIndex + 2);
                    cells.push({
                        row: rowIndex + 1,
                        column: columnIndex + 2,
                        box: new HorizontalListBox(item, cellRoleName, [projector(item), new AliasBox(item, "new-" + rowIndex, NBSP)]),
                        style: cellStyle
                    });
                });
            });
            // add an extra column where a new element to the list can be added
            cells.push({
                row: 1,
                column: property.length + 3,
                rowSpan: cellGetters.length,
                box: new AliasBox(element, "alias-add-column", "<add new column>"),
                style: cellStyle
            });
            // Add keyboard actions to grid such that new rows can be added by Return Key
            return this.addKeyBoardShortCuts(element, propertyName, editor, elementBuilder, cells);
        }
        return null;
    }

    /**
     * Adds two keyboard shortcuts to the editor: one to be able to insert a row/column, and one
     * to be able to insert a row/column in an empty grid.
     *
     * @param element
     * @param propertyName
     * @param editor
     * @param elementBuilder
     * @param cells
     * @private
     */
    private static addKeyBoardShortCuts(element: PiElement, propertyName: string, editor: PiEditor, elementBuilder: () => PiElement, cells: GridCell[]) {
        const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "tablebox");
        editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid(roleName, elementBuilder));
        editor.keyboardActions.splice(
            0,
            0,
            this.createKeyboardShortcutForEmptyCollectionGrid(propertyName, elementBuilder)
        );
        return new GridBox(element, roleName, cells);
    }

    /**
     * Create a keyboard shortcut for use in an element table
     * @param collectionRole
     * @param elementCreator
     * @param roleToSelect
     */
    private static createKeyboardShortcutForCollectionGrid(
        collectionRole: string,
        elementCreator: () => PiElement,
        roleToSelect?: string
    ): KeyboardShortcutBehavior {
        const listKeyboardShortcut: KeyboardShortcutBehavior = {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            // TODO The new-0... should become more generic.
            activeInBoxRoles: ["new-0", "new-1", "new-2", "new-3", "new-4", "new-5", "new-6", "new-7", "new-8", "new-9", "new-10"],
            action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
                const element = box.element;
                const proc = element.piContainer();
                const parent: PiElement = proc.container;
                PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
                const newElement: PiElement = elementCreator();
                parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);

                if (!!roleToSelect) {
                    editor.selectElement(newElement, roleToSelect);
                } else {
                    editor.selectElement(newElement);
                    editor.selectFirstEditableChildBox();
                    // await editor.selectFirstLeafChildBox();
                }
                return null;
            }
        };
        return listKeyboardShortcut;
    }

    /**
     * Create a keyboard shortcut for use in an empty table
     * @param propertyRole
     * @param elementCreator
     * @param roleToSelect
     * @private
     */
    private static createKeyboardShortcutForEmptyCollectionGrid(
        propertyRole: string,
        elementCreator: () => PiElement,
        roleToSelect?: string
    ): KeyboardShortcutBehavior {
        const listKeyboardShortcut: KeyboardShortcutBehavior = {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            activeInBoxRoles: ["alias-add-row", "alias-alias-add-row-textbox"],
            action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
                const element = box.element;
                const newElement: PiElement = elementCreator();
                element[propertyRole].push(newElement);

                if (!!roleToSelect) {
                    editor.selectElement(newElement, roleToSelect);
                } else {
                    editor.selectElement(newElement);
                    editor.selectFirstEditableChildBox();
                    // await editor.selectFirstLeafChildBox();
                }
                return null;
            }
        };
        return listKeyboardShortcut;
    }
}
