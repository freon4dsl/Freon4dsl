import { runInAction } from "mobx";
import {
    AliasBox,
    Box, BoxFactory,
    BoxUtils,
    GridBox,
    GridCell, GridOrientation,
    HorizontalListBox,
    KeyboardShortcutBehavior,
    PiEditor,
    PiStyle
} from "../index";
import { PiElement } from "../../language";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "../../util/Keys";
import { MetaKey, PiKey } from "../../util/Keys";
import { NBSP, PiLogger, PiUtils } from "../../util";
import { Language } from "../../storage";
import { RoleProvider } from "./RoleProvider";
import { merge } from "lodash";

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

type Location = { row: number, column: number};
const LOGGER = new PiLogger("TableUtil");

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
        return this.tableBox("row", element, propertyName, columnHeaders, cellGetters, editor);
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
        return this.tableBox("column", element, propertyName, rowHeaders, cellGetters, editor);
    }

    private static tableBox(orientation: GridOrientation, element: PiElement, propertyName: string, columnHeaders: string[],
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
                const location = this.tilt({row: 1, column: index + 1}, orientation);
                cells.push( {
                    row: location.row,
                    column: location.column,
                    box: BoxUtils.labelBox(element, item, "" + index),
                    style: headerStyle
                });
            });
            // add the cells for each element of the list
            property.forEach((item: PiElement, rowIndex: number) => {
                cellGetters.forEach((projector, columnIndex) => {
                    const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, rowIndex + 2, columnIndex + 1);
                    const location = this.tilt({row: rowIndex + 2, column: columnIndex + 1}, orientation);
                    cells.push({
                        row: location.row,
                        column: location.column,
                        box: BoxFactory.horizontalList(item, cellRoleName, [projector(item), BoxFactory.alias(item, "new-" + columnIndex, NBSP,
                            { propertyName: propertyName, conceptName: propInfo.type }
                             )]),
                        style: cellStyle
                    });
                });
            });
            // add an extra row where a new element to the list can be added
            const location = this.tilt({row: property.length + 3, column:1}, orientation);
            cells.push({
                row: location.row,
                column: location.column,
                columnSpan: (orientation === "row" ? cellGetters.length : 1),
                rowSpan: (orientation === "row" ? 1 : cellGetters.length),
                box: BoxFactory.alias(element, "alias-add-row-or-column", `<add new ${orientation}>`,
                    { propertyName: propertyName, conceptName: propInfo.type }),
                style: cellStyle
            });
            // Add keyboard actions to grid such that new rows can be added by Return Key
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "tablebox");
            this.addKeyBoardShortCuts(roleName, propertyName, editor, elementBuilder);
            return new GridBox(element, roleName, cells, { orientation: orientation } );
        }
        return null;
    }

    private static tilt(location: Location, orientation: string): Location {
        if (orientation === "column") {
            return { row: location.column, column: location.row}
        } else {
            return location;
        }
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
    private static addKeyBoardShortCuts(roleName: string, propertyName: string, editor: PiEditor, elementBuilder: () => PiElement) {
        editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid());
        editor.keyboardActions.splice(
            0,
            0,
            this.createKeyboardShortcutForEmptyCollectionGrid()
        );
    }

    /**
     * Create a keyboard shortcut for use in an element table
     * @param roleToSelect
     */
    private static createKeyboardShortcutForCollectionGrid(): KeyboardShortcutBehavior {
        return {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            // TODO The new-0... should become more generic.
            activeInBoxRoles: ["new-0", "new-1", "new-2", "new-3", "new-4", "new-5", "new-6", "new-7", "new-8", "new-9", "new-10",
                "alias-new-0-textbox", "alias-new-1-textbox", "alias-new-2-textbox", "alias-new-3-textbox", "alias-new-4-textbox",
                "alias-new-5-textbox", "alias-new-6-textbox", "alias-new-7-textbox", "alias-new-8-textbox", "alias-new-9-textbox"],
            action: (box: Box, key: PiKey, editor: PiEditor): PiElement => {
                const element = box.element;
                const proc = element.piContainer();
                const parent: PiElement = proc.container;
                PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
                const aliasBox = box.parent as AliasBox;
                LOGGER.log("New table row/column for " + aliasBox.propertyName + " concept " + aliasBox.conceptName);
                const newElement: PiElement = Language.getInstance().concept(aliasBox?.conceptName)?.constructor()
                if( newElement === undefined) {
                    // TODO Find out why this happens sometimes
                    LOGGER.log("Unexpected new element undefined");
                    return null;
                }
                runInAction( () => {
                    parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);
                });

                editor.selectElement(newElement);
                editor.selectFirstEditableChildBox();
                // await editor.selectFirstLeafChildBox();
                return newElement;
            }
        };
    }

    /**
     * Create a keyboard shortcut for use in an empty table
     * @param roleToSelect
     * @private
     */
    private static createKeyboardShortcutForEmptyCollectionGrid(): KeyboardShortcutBehavior {
        return {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            activeInBoxRoles: ["alias-add-row-or-column", "alias-alias-add-row-or-column-textbox"],
            action: (box: Box, key: PiKey, editor: PiEditor): PiElement => {
                const element = box.element;
                const aliasBox = box.parent as AliasBox;
                LOGGER.log("New table row/column for " + aliasBox.propertyName + " concept " + aliasBox.conceptName);
                const newElement: PiElement = Language.getInstance().concept(aliasBox?.conceptName)?.constructor();
                if( newElement === undefined) {
                    // TODO Find out why this happenss sometimes
                    LOGGER.log("Unexpected new element undefined");
                    return null;
                }
                runInAction( () => {
                    element[aliasBox.propertyName].push(newElement);
                });

                editor.selectElement(newElement);
                editor.selectFirstEditableChildBox();
                // await editor.selectFirstLeafChildBox();
                return newElement;
            }
        };
    }
}
