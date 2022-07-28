import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from "@testing-library/dom";

configure({ testIdAttribute: "id" });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ModelMaker } from "../models/ModelMaker";
import { ElementForGrid } from "../models/ElementForGrid";
import { GridComponent } from "../../components";
import { BoxFactory, BoxUtils, GridBox, GridCellBox, LabelBox, PiCompositeProjection, PiEditor } from "@projectit/core";
import { ElementWithManyAttrs } from "../models/ElementWithManyAttrs";
import Mock4Grid from "../mock-components/Mock4Grid.svelte";
import { componentId } from "../../components/util";

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
        gridBox.orientation = "row";
        render(Mock4Grid, { grid: gridBox, editor: myEditor });
        // take any element in the header row
        const cellElement = screen.getByTestId('LIST-OWNER-test-header2');
        expect(cellElement).not.toBeVisible();
        expect(cellElement).toHaveClass('gridcell-header');
        // TODO finish this
    });

    it("enter key causes execution of keyboard shortcut command", () => {
        // TODO
    });

});
