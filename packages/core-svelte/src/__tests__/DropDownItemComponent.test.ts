import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import { } from '@testing-library/dom';
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });
import { SelectOption } from "@projectit/core";
import { ElementWithOptional } from "./models/ElementWithOptional";
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../components/ChangeNotifier";
import DropDownItemComponent from "../components/DropDownItemComponent.svelte";

describe("DropDownItemComponent component", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let model: ElementWithOptional;
    let option: SelectOption = { id: "select-text", label: "select-text" };

    beforeEach(() => {
        // create a model and the boxes for the model
    });

    it("when selected has class 'isSelected'", () => {
        const result = render(DropDownItemComponent, { isSelected: true, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).toHaveClass("isSelected");
    });

    it("when not selected does not have class 'isSelected'", () => {
        const result = render(DropDownItemComponent, { isSelected: false, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).not.toHaveClass("isSelected");
    });

    it.skip("on click causes event 'pi-ItemSelected'", () => {
        const result = render(DropDownItemComponent, { isSelected: true, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        fireEvent.click(myElement);
        // TODO finish this test
    });

    it.skip("when hovered over the class changes", async () => {
        const result = render(DropDownItemComponent, { isSelected: true, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).not.toHaveClass("dropdownitem:hover");
        await fireEvent.mouseOver(myElement);
        expect(myElement).toHaveClass("dropdownitem:hover");
        // TODO finish this test, it does not seem to work
    });
});
