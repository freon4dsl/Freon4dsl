import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../components/ChangeNotifier";
import { MockVariables } from "./mock-components/MockVariables";
import Mock4Dropdown from "./mock-components/Mock4Dropdown.svelte";

describe("DropDownComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    it("arrow up wil not be propagated", async () => {
        const result = render(Mock4Dropdown);
        const myEnv = screen.getByTestId("mock-dropdown");
        expect(myEnv).toBeVisible();

        // press arrow up
        await fireEvent.keyPress(myEnv, {key: 'ArrowUp', code: 'ArrowUp',charCode: 38});
        // TODO finish test
        // expect(MockVariables.nrKeypress).toBe(0);
        // expect(MockVariables.nrKeydown).toBe(0);
    });

    it("arrow down changes current selection", () => {
    });

    it("enter causes a pi-ItemSelected event", () => {
    });

    it("escape or delete closes drop down, without pi-ItemSelected event", () => {
    });
});
