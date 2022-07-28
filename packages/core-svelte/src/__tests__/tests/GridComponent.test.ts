import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "id" });

import { GridBox, GridCellBox, LabelBox, PiCompositeProjection, PiEditor } from "@projectit/core";
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ModelMaker } from "../models/ModelMaker";
import { ElementForGrid } from "../models/ElementForGrid";
import { ElementWithManyAttrs } from "../models/ElementWithManyAttrs";
import Mock4Grid from "../mock-components/Mock4Grid.svelte";
import { pressKeys } from "./pressKeys";

describe("GridComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let model: ElementForGrid;
    const myEditor = new PiEditor(new PiCompositeProjection(), null);
    let gridBox: GridBox;

    beforeEach(() => {
        model = ModelMaker.makeGrid();
        let cells: GridCellBox[] = [];
        // add headers, there are four attrs in each element in the list, so four headers
        for (let i = 1; i < 5; i++) {
            const labelBox = new LabelBox(model, "test-header-label" + i, () => "Header" + i);
            cells.push(new GridCellBox(model, "test-header" + i, 1, i, labelBox, {isHeader: true}));
        }
        model.myList.forEach((item: ElementWithManyAttrs, index: number) => {
            for (let i = 1; i < 5; i++) {
                const attrName: string = "attr" + i; // results in attr1, attr2, attr3, attr4
                const labelBox = new LabelBox(item, "test-grid-cell-label" + i, () => item[attrName]);
                // push at row = index + 1 (header is at 1), column = i
                cells.push(new GridCellBox(item, "test-grid-cell" + i, index + 1, i, labelBox));
            }
        });
        gridBox = new GridBox(model, "test-grid-box", cells);
    });

    it("header is shown according to orientation", async () => {
        // gridBox.orientation = "row";
        render(Mock4Grid, { grid: gridBox, editor: myEditor });
        // take any element in the header row
        const cellElement = screen.getByTestId('LIST-OWNER-test-header2');
        expect(cellElement).toBeVisible();
        expect(cellElement).toHaveClass('gridcell-header');
        // TODO finish this
        const gridElement = screen.getByTestId('LIST-OWNER-test-grid-box');
        expect(gridElement).toBeVisible();
    });

    it("enter key causes execution of keyboard shortcut command", () => {
        // TODO
    });

    // Cannot get this test working in Propagation.test.ts,
    // but it is working here, so let's keep it in this file... :-(
    it("keyboard events are propagated", async () => {
        // render it
        render(Mock4Grid, { grid: gridBox, editor: myEditor });
        const gridElement = screen.getByTestId('LIST-OWNER-test-grid-box');
        expect(gridElement).toBeVisible();

        // test the keys on the grid
        await pressKeys(gridElement);

        // test the keys on a grid cell
        let cellElement = screen.getByText('first-attr2');
        expect(cellElement).toBeVisible();
        await pressKeys(cellElement);

        // test the keys on another grid cell
        cellElement = screen.getByText('third-attr1');
        expect(cellElement).toBeVisible();
        await pressKeys(cellElement);
    });
});
