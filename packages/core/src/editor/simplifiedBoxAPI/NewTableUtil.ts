import { runInAction } from "mobx";
import { PiCreateSiblingAction } from "../actions";
import { BoxFactory, ElementBox, TableBoxColumnOriented, TableBoxRowOriented, TableCellBox, TableRowBox } from "../boxes";
import {
    AliasBox,
    Box, BoxUtils,
    FreBoxProvider,
    FreProjectionHandler,
    GridOrientation,
    isAliasBox,
    PiCustomAction,
    PiEditor
} from "../index";
import { PiElement } from "../../ast";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import * as Keys from "../util/Keys";
import { MetaKey, PiKey } from "../util";
import { PiUtils } from "../../util";
import { Language } from "../../language";
import { RoleProvider } from "./RoleProvider";
import { PiLogger } from "../../logging";

type Location = { row: number, column: number };
const LOGGER = new PiLogger("NewTableUtil");

export class NewTableUtil {
    // Note that both tableBoxRowOriented and tableBoxColumnOriented look very similar.
    // They differ in the indexes etc. and can therefore not (easily) be combined.

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a row of the table.
     * A series of getters that each return a Box object must be present: one per column.
     *
     * @param element       The element that holds the list property.
     * @param list
     * @param propertyName  The name of the list property to be shown.
     * @param boxProviderCache
     * @param editor
     */
    public static tableBoxRowOriented(element: PiElement, list: PiElement[], propertyName: string, boxProviderCache: FreProjectionHandler, editor: PiEditor): Box {
        return this.tableBox("row", element, list, propertyName, boxProviderCache, editor);
    }

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a column of the table.
     * A series of getters that each return a Box object must be present: one per row.
     *
     * @param element       The element that holds the list property.
     * @param list
     * @param propertyName  The name of the list property to be shown.
     * @param boxProviderCache
     * @param editor
     */
    public static tableBoxColumnOriented(element: PiElement, list: PiElement[], propertyName: string, boxProviderCache: FreProjectionHandler, editor: PiEditor): Box {
        return this.tableBox("column", element, list, propertyName, boxProviderCache, editor);
    }

    public static rowBox(element: PiElement, propertyName: string, cells: Box[], mainIndex: number, hasHeaders: boolean): TableRowBox {
        if (hasHeaders) {
            mainIndex = mainIndex + 2;
        } else {
            mainIndex = mainIndex + 1; // css grid counts from 1, not 0
        }
        // todo check whether the indexes are set correctly
        const myContent = cells.map((cell, index) => {
            const cellRoleName: string = RoleProvider.cell(element.piLanguageConcept(), propertyName, index + 1, mainIndex);
            // console.log(`creating content cell for ${element.piLanguageConcept()+element.piId()} row ${mainIndex}, column ${index+1}`);
            return new TableCellBox(element, cellRoleName, mainIndex, index + 1, cell);
        });
        const role: string = RoleProvider.row(element.piLanguageConcept(), propertyName, mainIndex);
        return new TableRowBox(element, role, myContent);
    }

    private static tableBox(orientation: GridOrientation, element: PiElement, list: PiElement[], propertyName: string, boxProviderCache: FreProjectionHandler, editor: PiEditor) {
        // find the information on the property to be shown and check it
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        PiUtils.CHECK(propInfo.isList, `Cannot create a table for property '${element.piLanguageConcept()}.${propertyName}' because it is not a list.`);
        // create a list to hold all TableRowBoxes;
        let children: Box[] = [];
        let hasHeaders: boolean = false;
        // add the headers, if there are any
        const headers: string[] = boxProviderCache.getTableHeaders(propInfo.type);
        if (!!headers && headers.length > 0) {
            children.push(this.createHeaderBox(element, propertyName, headers, orientation));
            hasHeaders = true;
        }
        console.log('Adding headers to ' + element.piLanguageConcept() + element.piId() + ": " + headers + ", number of children: " + children.length)

        // add the children for each element of the list
        list.forEach((item: PiElement, index: number) => {
            const myProvider: FreBoxProvider = boxProviderCache.getBoxProvider(item);
            myProvider.mustUseTable(true); // todo find out when to set mustUseTable back to false
            const itemBox = myProvider.box;
            children.push(myProvider.box);
        });
        console.log('Adding rows to ' + element.piLanguageConcept() + element.piId() + ", number of children: " + children.length)
        // todo add an extra row where a new element to the list can be added
        // debugging log statement begin:
        for (const child of children) {
            if (child instanceof TableRowBox) {
                child.cells.map(cl => {
                    console.log(`[${cl.row} ${cl.column}] ${cl.element.piLanguageConcept()}-${cl.element.piId()}` );
                }).join(",\n")
            }
        }
        // debugging log statement end

        // return the actual table box
        const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "tablebox");
        if (orientation === "column") {
            return new TableBoxColumnOriented(element, roleName, hasHeaders, children);
        } else {
            return new TableBoxRowOriented(element, roleName, hasHeaders, children);
        }
    }

    private static tilt(location: Location, orientation: GridOrientation): Location {
        if (orientation === "column") {
            return { row: location.column, column: location.row };
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
            if (orientation === "column") {
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
     * @param nrOfRows
     * @param nrOfColumns
     * @param editor
     * @param conceptName
     * @private
     */
    private static addKeyBoardShortCuts(element: PiElement, propertyName: string, nrOfRows: number, nrOfColumns: number, editor: PiEditor, conceptName: string) {
        // editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid(element, propertyName, nrOfRows, nrOfColumns, elementBuilder));
        // editor.keyboardActions.splice(
        //     0,
        //     0,
        //     this.createKeyboardShortcutForEmptyCollectionGrid()
        // );
        editor.addOrReplaceAction(this.createKeyboardShortcutForCollectionGrid(element, propertyName, nrOfRows, nrOfColumns, conceptName));
        editor.addOrReplaceAction(this.createKeyboardShortcutForEmptyCollectionGrid());
    }

    /**
     * Create a keyboard shortcut for use in an element table
     *
     * @param element
     * @param propertyName
     * @param nrOfRows
     * @param nrOfColumns
     * @param conceptName
     * @private
     */
    private static createKeyboardShortcutForCollectionGrid(element: PiElement, propertyName: string, nrOfRows: number, nrOfColumns: number, conceptName: string): PiCreateSiblingAction {
        const rolenames: string[] = [];
        for (let row = 1; row <= nrOfRows; row++) {
            for (let column = 1; column <= nrOfColumns; column++) {
                const rolename = RoleProvider.cell(element.piLanguageConcept(), propertyName, row, column);
                rolenames.push(rolename);
                // LOGGER.log("Add keyboard [" + rolename + "] for r/c " + row + "." + column);
            }
        }
        // LOGGER.log("Adding Keybord for " + nrOfRows + " rows and " + nrOfColumns + " columns: " + rolenames);
        return new PiCreateSiblingAction({
            trigger: { meta: MetaKey.None, key: Keys.ENTER, code: Keys.ENTER }, activeInBoxRoles: rolenames, conceptName: conceptName

        });
    }

    /**
     * Create a keyboard shortcut for use in an empty table
     * @private
     */
    private static createKeyboardShortcutForEmptyCollectionGrid(): PiCustomAction {
        return PiCustomAction.create({
            trigger: { meta: MetaKey.None, key: Keys.ENTER, code: Keys.ENTER },
            activeInBoxRoles: ["alias-add-row-or-column", "alias-alias-add-row-or-column-textbox"],
            action: (box: Box, key: PiKey, editor: PiEditor): PiElement => {
                const element = box.element;
                const aliasBox = (isAliasBox(box) ? box : box.parent as AliasBox);
                LOGGER.log("2 New table row/column for " + aliasBox.propertyName + " concept " + aliasBox.conceptName);
                const newElement: PiElement = Language.getInstance().concept(aliasBox?.conceptName)?.constructor();
                if (newElement === undefined) {
                    // TODO Find out why this happens sometimes
                    LOGGER.log("EMPTY grid: Unexpected new element undefined");
                    return null;
                }
                runInAction(() => {
                    element[aliasBox.propertyName].push(newElement);
                });
                LOGGER.log("runInaction finished.");
                return newElement;
            }
        });
    }

    private static createHeaderBox(element: PiElement, propertyName: string, headers: string[], orientation: GridOrientation): TableRowBox {
        // todo take orientation into account in indexes
        const cells: Box[] = [];
        headers.forEach((head, index) => {
            const indexToUse: number = index + 1; // css grid counts from 1, not 0
            cells.push(BoxUtils.labelBox(element, head, `table-header-${indexToUse}`));
        });
        let result = NewTableUtil.rowBox(
            element,
            propertyName,
            cells,
            0,
            false
        );
        return result;
    }
}
