import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";

configure({ testIdAttribute: "id" });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import Mock4Dropdown from "../mock-components/Mock4Dropdown.svelte";
import { testOptions } from "../mock-components/options";
import { MockVariables } from "../mock-components/MockVariables";
import { SelectOption } from "@projectit/core";
import { selectedOptionId } from "../../components/DropdownStore";
import { get } from "svelte/store";

function checkSelectedItemComponent(option: SelectOption, isSelected: boolean) {
    // console.log("checkSelectedItemComponent called: " + option.id);
    // get the element of type DropdownItemComponent that corresponds with the option
    const item = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
    // the element should be visible and have the 'selected' style
    expect(item).toBeVisible();
    if (isSelected) {
        expect(item).toHaveClass("isSelected");
    }
}

describe("DropDownComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    it("enter causes a piItemSelected event", async () => {
        // TODO question: onClick should cause the same event, IMHO
        render(Mock4Dropdown, { optionId: 2 });
        const option = testOptions.find(o => Number(o.id) === 2);
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();

        MockVariables.reset();
        // press enter
        await fireEvent.keyPress(dropdown, { key: "Enter", code: "Enter", charCode: 13 });
        expect(MockVariables.nrKeypress).toBe(0); // Enter should not be propagated
        expect(MockVariables.nrPiItemSelected).toBe(1); // instead a custom event should be fired
        expect(MockVariables.piItemSelectedValues[MockVariables.piItemSelectedValues.length - 1]).toStrictEqual(option);
    });

    it("upon initialisation the selected option has the correct style", async () => {
        render(Mock4Dropdown, { optionId: 2 });
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();
        testOptions.forEach(opt => {
            checkSelectedItemComponent(opt, opt.id === get(selectedOptionId));
        });
    });

    it("arrow up wil not be propagated", async () => {
        render(Mock4Dropdown, { optionId: 2 });
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();

        MockVariables.reset();
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        expect(MockVariables.nrKeypress).toBe(0);
    });

    it("arrow down wil not be propagated", async () => {
        render(Mock4Dropdown, { optionId: 2 });
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();

        MockVariables.reset();
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowDown", code: "ArrowDown", charCode: 40 });
        expect(MockVariables.nrKeypress).toBe(0);
    });

    it("arrow up changes current selection", async () => {
        render(Mock4Dropdown, { optionId: "8" });
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();
        let option = testOptions.find(o => o.id === "8"); // this should be the option that is selected
        checkSelectedItemComponent(option, true);

        MockVariables.reset();
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        option = testOptions.find(o => o.id === "7"); // this should be the option that is selected by the arrow
        checkSelectedItemComponent(option, true);
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        option = testOptions.find(o => o.id === "6"); // this should be the option that is selected by the arrow
        checkSelectedItemComponent(option, true);
    });

    it("arrow down changes current selection", async () => {
        render(Mock4Dropdown, { optionId: "2" });
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();
        let option = testOptions.find(o => o.id === "2"); // this should be the option that is selected
        checkSelectedItemComponent(option, true);

        MockVariables.reset();
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowDown", code: "ArrowDown", charCode: 40 });
        option = testOptions.find(o => o.id === "3"); // this should be the option that is selected by the arrow
        checkSelectedItemComponent(option, false);
        // press arrow up
        await fireEvent.keyPress(dropdown, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        option = testOptions.find(o => o.id === "4"); // this should be the option that is selected by the arrow
        checkSelectedItemComponent(option, false);
    });

    it("escape or delete closes drop down, without piItemSelected event", async () => {
        render(Mock4Dropdown);
        const dropdown = screen.getByTestId(`dropdown-${testOptions.map(opt => opt.label).join("-")}`);
        expect(dropdown).toBeVisible();

        MockVariables.reset();
        // press escape
        await fireEvent.keyPress(dropdown, { key: "Escape", code: "Escape", charCode: 27 });
        expect(MockVariables.nrKeypress).toBe(0);
        expect(MockVariables.nrKeyup).toBe(0);
        expect(MockVariables.nrKeydown).toBe(0);
        expect(MockVariables.nrPiItemSelected).toBe(0);
        expect(dropdown).not.toBeVisible();

        // press enter
        await fireEvent.keyPress(dropdown, { key: "Delete", code: "Delete", charCode: 46 });
        expect(MockVariables.nrKeypress).toBe(0);
        expect(MockVariables.nrKeyup).toBe(0);
        expect(MockVariables.nrKeydown).toBe(0);
        expect(MockVariables.nrPiItemSelected).toBe(0);
        expect(dropdown).not.toBeVisible();
    });
});


