import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";

describe("AliasComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    it("on click: dropdown is visible", async () => {
    // TODO
    });

    it("on entry through keyboard no dropdown is shown", () => {
        // TODO
    });

    it("ctr-space : toggle drop down", () => {
        // TODO
    });

    it("when text is entered in text box then the options in drop down are filtered accordingly", () => {
        //  TODO
    });

    it("when text entered in text box is equal to option, this option is selected and its alias action is executed", () => {
        // TODO
    });

    it("place holder is shown if text field is empty", () => {
        // TODO
    });

    it("when nothing is selected from drop down options and component loses focus then dropdown should be closed", () => {
        //  TODO
    });

    it("when nothing is selected from drop down options and component loses focus then textcomponent should be empty", () => {
        // TODO question: why empty and not the previous value
        // TODO
    });

    it("when drop down is visible then arrow up and down keys should be handled by dropdown", () => {
        // TODO
    });

    it("escape key closes dropdown", () => {
        //  TODO
    });
});
