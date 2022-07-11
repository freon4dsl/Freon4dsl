import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";

// from https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

// ❌
// fireEvent.change(input, {target: {value: 'hello world'}})

// ✅
// userEvent.type(input, 'hello world')

describe("TextComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    it("when textcomponent loses focus and the text is altered, the text should be stored in the box", async () => {
    // TODO
    });

    it("when click outside: textbox loses focus", () => {
        // TODO
    });

    it("when empty, placeholder should be present", () => {
        // TODO
    });

    it("keyPressAction as stated in textbox should be executed", () => {
        //  TODO
    });

    it("other keyboard events are propagated", async () => {
        // TODO
    });

    it("on click: the caret position is set correctly in the textbox", async () => {
        // TODO
    });

});
