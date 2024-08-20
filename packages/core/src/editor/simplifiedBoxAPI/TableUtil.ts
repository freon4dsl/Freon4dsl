import {
    BoxFactory,
    isTableRowBox,
    TableBox,
    TableBoxColumnOriented,
    TableBoxRowOriented,
    TableCellBox,
    TableRowBox,
} from "../boxes";
import { Box, FreBoxProvider, FreProjectionHandler, GridOrientation } from "../index";
import { FreNode } from "../../ast";
import { isNullOrUndefined, FreUtils } from "../../util";
import { FreLanguage } from "../../language";
import { RoleProvider } from "./RoleProvider";
import { FreHeaderProvider } from "../projections/FreHeaderProvider";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("NewTableUtil");

export class TableUtil {
    // Note that both tableBoxRowOriented and tableBoxColumnOriented look very similar.
    // They differ in the indexes etc. and can therefore not (easily) be combined.

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a row of the table.
     * A series of getters that each return a Box object must be present: one per column.
     *
     * @param node       The element that holds the list property.
     * @param list
     * @param propertyName  The name of the list property to be shown.
     * @param boxProviderCache
     */
    public static tableBoxRowOriented(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        boxProviderCache: FreProjectionHandler,
    ): Box {
        return this.tableBox("row", node, list, propertyName, boxProviderCache);
    }

    /**
     * Returns a GridBox that is a table representation of property with name 'propertyName'
     * within 'element'. The property must be a list. Each element of the list is shown in a column of the table.
     * A series of getters that each return a Box object must be present: one per row.
     *
     * @param node       The element that holds the list property.
     * @param list
     * @param propertyName  The name of the list property to be shown.
     * @param boxProviderCache
     */
    public static tableBoxColumnOriented(
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        boxProviderCache: FreProjectionHandler,
    ): Box {
        return this.tableBox("column", node, list, propertyName, boxProviderCache);
    }

    public static rowBox(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        cells: Box[],
        rowIndex: number,
        hasHeaders: boolean,
    ): TableRowBox {
        if (isNullOrUndefined(rowIndex)) {
            console.log("NO rowIndex for TableRowBox! " + node.freLanguageConcept() + node.freId());
        }
        // Note that css grid counts from 1, not 0, which is common in lists.
        let gridIndex: number;
        if (hasHeaders) {
            gridIndex = rowIndex + 2;
        } else {
            gridIndex = rowIndex + 1;
        }
        const myContent = cells.map((cell, index) => {
            const cellRoleName: string = RoleProvider.cell(
                node.freLanguageConcept(),
                propertyName,
                gridIndex,
                index + 1,
            );
            return new TableCellBox(
                node,
                propertyName,
                rowIndex,
                conceptName,
                cellRoleName,
                gridIndex,
                index + 1,
                cell,
            );
        });
        const role: string = RoleProvider.row(node.freLanguageConcept(), propertyName, gridIndex);
        const result = new TableRowBox(node, role, myContent, gridIndex);
        result.propertyName = propertyName;
        result.propertyIndex = rowIndex;
        return result;
    }

    private static tableBox(
        orientation: GridOrientation,
        node: FreNode,
        list: FreNode[],
        propertyName: string,
        boxProviderCache: FreProjectionHandler,
    ): TableBox {
        // console.log('calling tableBox')
        // Find the information on the property to be shown and check it.
        const propInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        FreUtils.CHECK(
            propInfo.isList,
            `Cannot create a table for property '${node.freLanguageConcept()}.${propertyName}' because it is not a list.`,
        );
        // Create the TableRowBoxes.
        const children: Box[] = [];
        let hasHeaders: boolean = false;
        let nrOfColumns: number = 0;
        if (!isNullOrUndefined(list) && list.length > 0) {
            // Add the headers, an empty TableRowBox if there are none.
            const headerProvider: FreHeaderProvider = boxProviderCache.getHeaderProvider(
                node,
                propertyName,
                propInfo.type,
            );
            children.push(headerProvider.box);
            if (headerProvider.hasContent()) {
                hasHeaders = true;
            }
            // Add the children for each element of the list.
            list.forEach((item) => {
                const myProvider: FreBoxProvider = boxProviderCache.getBoxProvider(item);
                const itemBox = myProvider.box;
                if (nrOfColumns === 0 && isTableRowBox(itemBox)) {
                    nrOfColumns = (itemBox as TableRowBox).cells.length;
                }
                children.push(itemBox);
            });
        } else {
            // Add an extra row where a new element to the list can be added.
            children.push(this.createPlaceHolder(node, propertyName, propInfo.type, orientation));
        }

        // return the actual table box
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "tablebox");
        if (orientation === "column") {
            return new TableBoxColumnOriented(node, propertyName, propInfo.type, roleName, hasHeaders, children);
        } else {
            return new TableBoxRowOriented(node, propertyName, propInfo.type, roleName, hasHeaders, children);
        }
    }

    private static createPlaceHolder(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        orientation: GridOrientation,
    ): TableRowBox {
        const content = BoxFactory.action(node, "alias-add-row-or-column", `<add new ${orientation}>`, {
            propertyName: propertyName,
            conceptName: conceptName,
        });
        // Note that a placeholder is only added when there are no other elements in the table, therefore its index is always 0.
        return TableUtil.rowBox(node, propertyName, conceptName, [content], 0, false);
    }
}
