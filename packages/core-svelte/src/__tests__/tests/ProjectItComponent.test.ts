import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";

describe("ProjectItComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    it("scroll set the right x,y-values for zero point", async () => {
    // TODO
    });

    it("tab key is handled", () => {
        // TODO
    });

    it("shift-tab key is handled", () => {
        // TODO
    });

    it("arrow-up key is handled", () => {
        //  TODO
    });

    it("arrow-down key is handled", () => {
        //  TODO
    });

    it("arrow-left key is handled", () => {
        //  TODO
    });

    it("arrow-right key is handled", () => {
        //  TODO
    });

    it("ctrl-up key is handled", () => {
        //  TODO
    });
});
