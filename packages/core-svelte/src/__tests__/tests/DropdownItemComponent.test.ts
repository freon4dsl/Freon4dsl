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
import { selectedOptionId } from "../../components/DropdownStore";

describe("DropDownItemComponent component", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let option: SelectOption = { id: "1", label: "select-text" };

    it("when selected has class 'isSelected'", async () => {
        // currentSelectedOptionId.set(option.id); // when set after rendering, 'await' is needed
        const result = render(DropdownItemComponent, { option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        await selectedOptionId.set(option.id); // when set after rendering, 'await' is needed
        expect(myElement).toHaveClass("isSelected");
    });

    it("when not selected does not have class 'isSelected'", async () => {
        selectedOptionId.set("23");
        const result = render(DropdownItemComponent, { option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).not.toHaveClass("isSelected");
    });

    it("when hovered over the style changes", async () => {
        const user = userEvent.setup(); // do not use in before hook, see https://kentcdodds.com/blog/avoid-nesting-when-youre-testing
        const result = render(DropdownItemComponent, { option: option });
        const myElement = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(myElement).toBeVisible();
        expect(myElement).toHaveStyle("color: var(--freon-dropdownitem-component-color, darkblue)");
        await userEvent.hover(myElement);
        expect(myElement).toHaveStyle("color: var(--freon-dropdownitem-component-hover-color, darkblue)");
    });

    it("on click causes event 'piItemSelected' and changes style", async () => {
        const result = render(Mock4DropdownItem);
        const item = screen.getByTestId(`dropdown-item-${option.label}-${option.id}`);
        expect(item).toBeVisible();
        expect(item).not.toHaveClass("isSelected");
        await fireEvent.click(item);
        expect(MockVariables.nrPiItemSelected).toBe(1);
        expect(MockVariables.piItemSelectedValues[MockVariables.piItemSelectedValues.length-1]).toStrictEqual(option);
        expect(item).toHaveClass("isSelected");
    });
});
