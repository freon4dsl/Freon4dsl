import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { SelectOption } from "@projectit/core";
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import DropdownItemComponent from "../../components/DropdownItemComponent.svelte";
import Mock4DropdownItem from "../mock-components/Mock4DropdownItem.svelte";
import { MockVariables } from "../mock-components/MockVariables";

describe("DropDownItemComponent component", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let option: SelectOption = { id: "select-text", label: "select-text" };

    it("when selected has class 'isSelected'", () => {
        const result = render(DropdownItemComponent, { isSelected: true, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).toHaveClass("isSelected");
    });

    it("when not selected does not have class 'isSelected'", () => {
        const result = render(DropdownItemComponent, { isSelected: false, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).not.toHaveClass("isSelected");
    });

    it("when hovered over the style changes", async () => {
        const user = userEvent.setup(); // do not use in before hook, see https://kentcdodds.com/blog/avoid-nesting-when-youre-testing
        const result = render(DropdownItemComponent, { isSelected: true, option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).toHaveStyle("color: var(--freon-dropdownitem-component-color, darkblue)");
        await userEvent.hover(myElement);
        expect(myElement).toHaveStyle("color: var(--freon-dropdownitem-component-hover-color, darkblue)");
    });

    it("on click causes event 'pi-ItemSelected'", async () => {
        let option: SelectOption = { id: "select-text", label: "select-text" };
        const result = render(Mock4DropdownItem, {});
        const item = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(item).toBeVisible();
        await fireEvent.click(item);
        expect(MockVariables.nrPi_itemSelected).toBe(1);
        expect(MockVariables.pi_itemSelectedValues[MockVariables.pi_itemSelectedValues.length-1]).toStrictEqual(option);
    });
});
