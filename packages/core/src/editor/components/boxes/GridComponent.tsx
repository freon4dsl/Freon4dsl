import * as classNames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";

import { Box } from "../../boxes/Box";
import { GridCell, GridBox } from "../../boxes/GridBox";
import { PiEditor } from "../../PiEditor";

export type GridComponentProps = {
    box: GridBox;
    editor: PiEditor;
    renderBoxCallback: (box: Box, editor: PiEditor) => any;
};

const styles: {
    maingrid: string;
    gridcell: string;
} = require("../styles/grid.scss");

@observer
export class GridComponent extends React.Component<GridComponentProps, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const columns: string = "repeat(" + this.props.box.numberOfColumns() + ", auto)";
        const rows: string = "repeat(" + this.props.box.numberOfRows() + ", auto)";
        const className = classNames(this.props.box.style, styles.maingrid);

        return (
            <div
                id={this.props.box.id}
                className={className}
                onClick={this.onClick}
                style={{ gridTemplateColumns: columns, gridTemplateRows: rows }}
            >
                {this.props.box.cells.map(this.renderCell)}
            </div>
        );
    }

    onClick = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    onCellClick = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    renderCell = (cell: GridCell) => {
        const className = classNames(cell.style, styles.gridcell);

        return (
            <div
                id={this.props.box.id + "-c:" + cell.column + "-r:" + cell.row}
                className={className}
                key={this.props.box.id + "-r:" + cell.row + "-c:" + cell.column}
                style={{ gridRow: this.row(cell), gridColumn: this.column(cell) }}
                onClick={this.onCellClick}
            >
                {this.props.renderBoxCallback(cell.box, this.props.editor)}
            </div>
        );
    };

    row = (cell: GridCell): string => {
        return cell.row + (cell.rowSpan ? " / span " + cell.rowSpan : "");
    };

    column = (cell: GridCell): string => {
        return cell.column + (cell.columnSpan ? " / span " + cell.columnSpan : "");
    };
}
