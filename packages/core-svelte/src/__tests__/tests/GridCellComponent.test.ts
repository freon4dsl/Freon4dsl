import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import {
    GridBox,
    GridCellBox,
    LabelBox,
    MetaKey, PI_NULL_COMMAND,
    PiCommand,
    PiCompositeProjection,
    PiEditor,
    PiUtils
} from "@projectit/core";
import { ModelMaker } from "../models/ModelMaker";
import { ElementForGrid } from "../models/ElementForGrid";
import { ElementWithManyAttrs } from "../models/ElementWithManyAttrs";
import Mock4GridCell from "../mock-components/Mock4GridCell.svelte";
import { componentId } from "../../components/util";

describe("GridCellComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let cellBox: GridCellBox;
    let gridBox: GridBox; // dummy
    let innerBox: LabelBox;
    let gridElement: ElementWithManyAttrs;
    const myEditor = new PiEditor(new PiCompositeProjection(), null);

    beforeEach(()=> {
        const model: ElementForGrid = ModelMaker.makeGrid();
        gridElement = model.myList[3];
        innerBox = new LabelBox(gridElement, "label-test", () => gridElement.attr2);
        cellBox = new GridCellBox(gridElement, "grid-cell-test", 2, 3, innerBox);
        gridBox = new GridBox(model, "test-grid-box", [cellBox]);
    })

    it("grid cell is present at right column/row in its grid", async () => {
        const result = render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        const cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveStyle('grid-row: 2 / span 1; grid-column: 3 / span 1;');
        expect(cellElement).not.toHaveClass('gridcell-header');
    });

    it("rowSpan en columnSpan are correctly executed", () => {
        cellBox.rowSpan = 3;
        cellBox.columnSpan = 2;
        const result = render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        const cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveStyle('grid-row: 2 / span 3; grid-column: 3 / span 2;');
    });

    it("when gridCellBox.isHeader the style is adjusted", () => {
        cellBox.isHeader = true;
        const result = render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        const cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcell-header');
    });

    it("with row orientation, and an even row number, the style is gridcellEven", () => {
        gridBox.orientation = "row";
        render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        let cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcellEven'); // the element has this value because its row is 2
    });

    it("with row orientation, and an odd row number, the style is gridcellOdd", () => {
        cellBox = new GridCellBox(gridElement, "grid-cell-test", 1, 3, innerBox);
        gridBox.orientation = "row";
        render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        let cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcellOdd'); // the element has this value because its row is 1
    });

    it("with column orientation, and an even column number, the style is gridcellEven", () => {
        cellBox = new GridCellBox(gridElement, "grid-cell-test", 1, 2, innerBox);
        gridBox.orientation = "column";
        render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        let cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcellEven'); // the element has this value because its column is 2
    });

    it("with column orientation, and an odd column number, the style is gridcellOdd", () => {
        gridBox.orientation = "column";
        render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        let cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcellOdd'); // the element has this value because its column is 3
    });

    it("enter key causes execution of keyboard shortcut command", async () => {
        // TODO question: how do I add an action to the editor here
        render(Mock4GridCell, {grid: gridBox, cell: cellBox, editor: myEditor});
        let cellElement = screen.getByTestId(componentId(cellBox));
        expect(cellElement).toBeVisible();
        // find the command that should be executed
        const cmd: PiCommand = PiUtils.findKeyboardShortcutCommand({
            meta: MetaKey.None,
            key:  'Enter',
            code: 'Enter'
        }, cellBox, myEditor);
        expect(cmd).not.toBeNull();
        expect(cmd).not.toBeUndefined();
        // expect(cmd).not.toBe(PI_NULL_COMMAND);
        // press enter
        await fireEvent.keyPress(cellElement, { key: "Enter", code: "Enter", charCode: 13 });
        //
        if (cmd !== PI_NULL_COMMAND) {

        }
        // TODO finish this
    });
});
