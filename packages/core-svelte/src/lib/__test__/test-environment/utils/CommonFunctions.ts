import {
    type Box,
    type FreNamedNode,
    type FreNode, HorizontalListBox,
    LabelBox, ListBox, ListDirection, TableBox, TableBoxColumnOriented,
    TableBoxRowOriented,
    TableCellBox,
    TableDirection,
    TableRowBox, VerticalListBox
} from "@freon4dsl/core";

export function makeListBox<T extends FreNamedNode>(parent: FreNode, list: T[], propName: string, direction: ListDirection): ListBox {
    let listChildren: Box[] = [];
    list.forEach((xx) => {
        listChildren.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `${xx.name}`;
            })
        );
    });
    if (direction === ListDirection.HORIZONTAL) {
        return new HorizontalListBox(
            parent,
            propName + '-list-role',
            propName,
            listChildren
        );
    } else {
        return new VerticalListBox(
            parent,
            propName + '-list-role',
            propName,
            listChildren
        );
    }
}

export function makeTableBox<T extends FreNamedNode>(parent: FreNode, list: T[], propName: string, typeName: string, direction: TableDirection): TableBox {
    let tableRows: TableRowBox[] = [];
    let cells: TableCellBox[] = [];
    list.forEach((xx, index) => {
        const cellBox = new TableCellBox(
            xx,
            propName,
            index,
            typeName,
            propName + '-table-cell-box',
            1,
            index + 1,
            new LabelBox(xx, 'table-label-box', () => {
                return `${xx.name}`;
            })
        );
        cells.push(cellBox);
    });
    tableRows.push(new TableRowBox(parent, propName + '-row1', cells, 0));
    if (direction === TableDirection.HORIZONTAL) {
        return new TableBoxRowOriented(
            parent,
            propName,
            typeName,
            propName + '-table',
            false,
            tableRows
        );
    } else {
        return new TableBoxColumnOriented(
            parent,
            propName,
            typeName,
            propName + '-table',
            false,
            tableRows
        );
    }
}
