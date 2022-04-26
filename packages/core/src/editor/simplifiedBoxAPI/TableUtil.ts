import { runInAction } from "mobx";
import { PiCreateSiblingAction } from "../actions/PiCreateSiblingAction";
import { GridCellBox } from "../boxes/GridCellBox";
import {
    AliasBox,
    Box, BoxFactory,
    BoxUtils,
    GridBox,
    GridOrientation,
    isAliasBox, PiCustomAction,
    PiEditor,
    PiStyle
} from "../index";
import { PiElement } from "../../ast";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "../../util/Keys";
import { MetaKey, PiKey } from "../../util/Keys";
import { NBSP, PiLogger, PiUtils } from "../../util";
import { Language } from "../../language";
import { RoleProvider } from "./RoleProvider";

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
        LOGGER.log("TABLE BOX CREATION for " + propertyName + " size " + property.length)
        // const elementBuilder = Language.getInstance().concept(propInfo.type).constructor;
        const hasHeaders = columnHeaders !== null && columnHeaders !== undefined && columnHeaders.length > 0;
        // create the box
        if (property !== undefined && property !== null) {
            const cells: GridCellBox[] = [];
            // add the headers - all in row 1
            columnHeaders.forEach((item: string, index: number) => {
                const location = this.calcHeaderLocation({row: 1, column: index + 1}, orientation, hasHeaders);
                LOGGER.log("TableUtil header " + location.row + " - " + location.column + " with headers " + hasHeaders );
                cells.push( BoxFactory.gridcell(element, "cell-" + location.row + "-" + location.column, location.row, location.column,
                    BoxUtils.labelBox(element, item, "" + index),
                    { style : headerStyle })
                );
            });
            // add the cells for each element of the list
            property.forEach((item: PiElement, rowIndex: number) => {
                cellGetters.forEach((projector, columnIndex) => {
                    const location = this.calcLocation({row: rowIndex + 1, column: columnIndex + 1}, orientation, hasHeaders);

                    const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, location.row, location.column);
                    LOGGER.log("TableUtil add " + cellRoleName + " with headers " + hasHeaders );
                    cells.push(BoxFactory.gridcell(item, cellRoleName, location.row, location.column,
                            projector(item),
                        { style: cellStyle }
                    ));
                });
            });
            // add an extra row where a new element to the list can be added
            const location = this.calcLocation({row: property.length +1, column:1}, orientation, hasHeaders);
            const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, location.row, location.column);
            LOGGER.log("TableUtil footer " + location.row + " - " + location.column + " with headers " + hasHeaders );
            cells.push( BoxFactory.gridcell(element, cellRoleName,  location.row, location.column,
                BoxFactory.alias(element, "alias-add-row-or-column", `<add new ${orientation}>`,
                { propertyName: propertyName, conceptName: propInfo.type }),
                {
                    columnSpan: (orientation === "row" ? cellGetters.length : 1),
                    rowSpan: (orientation === "row" ? 1 : cellGetters.length),
                    style: cellStyle
            }));
            // Add keyboard actions to grid such that new rows can be added by Return Key
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "tablebox");
            const nrOfRowsAndColumns = this.calcLocation( {row: property.length, column: cellGetters.length}, orientation, hasHeaders);
            this.addKeyBoardShortCuts(element, propertyName, nrOfRowsAndColumns.row, nrOfRowsAndColumns.column,editor, propInfo.type);
            return new GridBox(element, roleName, cells, { orientation: orientation } );
        }
        return null;
    }

    private static tilt(location: Location, orientation: GridOrientation): Location {
        if (orientation === "column") {
            return { row: location.column, column: location.row};
        } else {
            return location;
        }
    }
    private static calcHeaderLocation(location: Location, orientation: GridOrientation, hasHeaders: boolean): Location {
        return this.tilt(location, orientation);
    }

    private static calcLocation(location: Location, orientation: GridOrientation, hasHeaders: boolean): Location {
        const result = this.tilt(location, orientation);
        if (hasHeaders) {
            if (orientation === "column" ) {
                result.column = result.column + 1;
            } else {
                result.row = result.row + 1;
            }
        }
        return result;
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
    private static addKeyBoardShortCuts(element: PiElement,propertyName: string, nrOfRows: number, nrOfColumns: number, editor: PiEditor, conceptName: string) {
        // editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid(element, propertyName, nrOfRows, nrOfColumns, elementBuilder));
        // editor.keyboardActions.splice(
        //     0,
        //     0,
        //     this.createKeyboardShortcutForEmptyCollectionGrid()
        // );
        editor.addOrReplaceAction(this.createKeyboardShortcutForCollectionGrid(element, propertyName, nrOfRows, nrOfColumns, conceptName));
        editor.addOrReplaceAction(this.createKeyboardShortcutForEmptyCollectionGrid()
        );
    }

    /**
     * Create a keyboard shortcut for use in an element table
     * @param roleToSelect
     */
    private static createKeyboardShortcutForCollectionGrid(element: PiElement, propertyName: string, nrOfRows: number, nrOfColumns: number, conceptName: string): PiCreateSiblingAction {
        const rolenames: string[] = [];
        for(let row = 1; row <= nrOfRows; row++) {
            for(let column = 1; column <= nrOfColumns; column++) {
                const rolename = RoleProvider.cell(element.piLanguageConcept(), propertyName, row, column);
                rolenames.push(rolename);
                // LOGGER.log("Add keyboard [" + rolename + "] for r/c " + row + "." + column);
            }
        }
        // LOGGER.log("Adding Keybord for " + nrOfRows + " rows and " + nrOfColumns + " columns: " + rolenames);
        const result = new PiCreateSiblingAction({
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            activeInBoxRoles: rolenames,
            conceptName: conceptName,

        });
        return result;
    }

    /**
     * Create a keyboard shortcut for use in an empty table
     * @param roleToSelect
     * @private
     */
    private static createKeyboardShortcutForEmptyCollectionGrid(): PiCustomAction {
        return PiCustomAction.create({
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            activeInBoxRoles: ["alias-add-row-or-column", "alias-alias-add-row-or-column-textbox"],
            action: (box: Box, key: PiKey, editor: PiEditor): PiElement => {
                const element = box.element;
                const aliasBox = (isAliasBox(box) ? box : box.parent as AliasBox);
                LOGGER.log("2 New table row/column for " + aliasBox.propertyName + " concept " + aliasBox.conceptName);
                const newElement: PiElement = Language.getInstance().concept(aliasBox?.conceptName)?.constructor();
                if( newElement === undefined) {
                    // TODO Find out why this happenss sometimes
                    LOGGER.log("EMPTY grid: Unexpected new element undefined");
                    return null;
                }
                runInAction( () => {
                    element[aliasBox.propertyName].push(newElement);
                });
                LOGGER.log("runInaction finished.")
                return newElement;
            }
        });
    }
}
