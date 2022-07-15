import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { GridCellBox, LabelBox } from "@projectit/core";
import { ModelMaker } from "../models/ModelMaker";
import { ElementForGrid } from "../models/ElementForGrid";
import { ElementWithManyAttrs } from "../models/ElementWithManyAttrs";

describe("GridCellComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let myBox: GridCellBox;
    let innerBox: LabelBox;
    let gridElement: ElementWithManyAttrs;

    beforeEach(()=> {
        const model: ElementForGrid = ModelMaker.makeGrid();
        gridElement = model.myList[3];
        innerBox = new LabelBox(gridElement, "label-test", () => gridElement.attr2);
        myBox = new GridCellBox(gridElement, "grid-cell-test", 2, 3, innerBox);
    })

    it("grid cell is present at right column/row in its grid", async () => {
    // TODO
    });

    it("rowSpan en columnSpan are correctly executed", () => {
        // TODO
    });

    it("when gridCellBox.isHeader the style is adjusted", () => {
        // TODO
    });

    it("enter key causes execution of keyboard shortcut command", () => {
        // TODO
    });

    it("based on orientation, the style is adjusted", () => {
        //  TODO
    });
});
