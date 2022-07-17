import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";

configure({ testIdAttribute: "id" });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ModelMaker } from "../models/ModelMaker";
import { OptionalBox, PiCaret, PiCompositeProjection, PiEditor, TextBox } from "@projectit/core";
import { ElementWithText } from "../models/ElementWithText";
import Mock4Text from "../mock-components/Mock4Text.svelte";
import { componentId } from "../../components/util";
import Mock4TextDouble from "../mock-components/Mock4TextDouble.svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

describe("TextComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    const myEditor = new PiEditor(new PiCompositeProjection(), null);
    let textBox1: TextBox;
    let textBox2: TextBox;
    let model: ElementWithText;

    beforeEach(() => {
        // create a model and the boxes for the model
        model = ModelMaker.makeText();
        textBox1 = new TextBox(
            model,
            "test-text-role1",
            () => { return model.myText1; },
            (txt) => { model.myText1 = txt; }
        );
        textBox2 = new TextBox(
            model,
            "test-text-role2",
            () => { return model.myText2; },
            (txt) => { model.myText2 = txt; }
        );
        // add parent boxes, because otherwise 'isAliasTextBox' throws null pointer
        const parentBox1 = new OptionalBox(model, "parent-role1", () => {return true;}, textBox1, false, "someAliasText" );
        const parentBox2 = new OptionalBox(model, "parent-role2", () => {return true;}, textBox2, false, "someAliasText" );
    });

    it("when empty, placeholder should be present", () => {
        model.myText1 = null;
        textBox1.placeHolder = "PLACEHOLDER";
        render(Mock4Text, { box: textBox1, editor: myEditor });
        const myText = screen.getByTestId(componentId(textBox1));
        expect(myText).toBeVisible();
        expect(myText).toHaveAttribute("data-placeholdertext", textBox1.placeHolder); // there is a placeholder
        expect(myText.getAttribute("text")).toBeNull(); // there is no text, because model.myText = null
        expect(myText).toHaveStyle("opacity: 50%;"); // TODO is there another manner to check whether the text component is empty?
    });

    it("when textbox gets focus: textcomponent gets focus", () => {
        render(Mock4Text, { box: textBox1, editor: myEditor });
        const myOwner = screen.getByTestId("mock-text");
        expect(myOwner).toBeVisible();
        const myText = screen.getByTestId(componentId(textBox1));
        expect(myText).toBeVisible();
        expect(myText).not.toHaveFocus();

        // set the focus to the textcomponent
        textBox1.setFocus();
        expect(myText).toHaveFocus();
        expect(document.activeElement).toBe(myText);
    });

    it("when click outside: textbox loses focus", () => {
        // this test needs two elements: both SelectableComponents, in order for the click outside to be noticed
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        const owner1 = screen.getByTestId("mock-text1");
        expect(owner1).toBeVisible();
        const text1 = screen.getByTestId(componentId(textBox1));
        expect(text1).toBeVisible();
        expect((text1.innerHTML)).toBe('initialText1')
        expect(text1).not.toHaveFocus();

        // set the caret position from the textBox
        textBox1.setCaret(PiCaret.LEFT_MOST);

        // The following does not work because jsdom does not support 'getBoundingClientRect'.
        // Therefore, we cannot test a mouse click on a specific position within the text.
        // const { left, top, width, height } = text1.getBoundingClientRect();
        // console.log(`left: ${left}, top: ${top}, width: ${width}, height: ${height}`);
        // console.log(`text1.clientLeft: ${text1.clientLeft}, text1.clientTop: ${text1.clientTop}, text1.clientWidth: ${text1.clientWidth}, text1.clientHeight: ${text1.clientHeight}`);
        // click on text component on location [800,0]
        // fireEvent(text1, new MouseEvent('click', {
        //     bubbles: false,
        //     cancelable: true,
        //     clientX: 800,
        //     clientY: 0
        // }));

        fireEvent.click(text1);
        expect(text1).toHaveFocus();
        expect(textBox1.caretPosition).toBe(0);

        // click on other element
        const text2 = screen.getByTestId(componentId(textBox2));
        expect(text2).toBeVisible();
        fireEvent.click(text2);
        expect(text1).not.toHaveFocus();
    });

    it("when textcomponent loses focus and the text is altered, the text should be stored in the box", async () => {
        // this test needs two elements: both SelectableComponents, in order for the click outside to be noticed
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        const text1 = screen.getByTestId(componentId(textBox1));
        const text2 = screen.getByTestId(componentId(textBox2));

        // set the focus
        fireEvent.click(text1);
        expect(text1).toHaveFocus();

        // set the caret position
        // TODO setting the caret does not change the position at which the text is added
        textBox1.setCaret(PiCaret.LEFT_MOST);

        // alter the text
        // fireEvent.change(input, {target: {value: 'hello world'}})
        const user = userEvent.setup();
        await user.type(text1, ': hello world'); // TODO does not react to special chars
        expect(text1.innerHTML).toBe('initialText1: hello world');
        expect(text2.innerHTML).toBe('initialText2');
        // expect(textBox1.caretPosition).toBe('initialText1: hello world'.length);
        // expect(textBox1.caretPosition).toBe(text1.innerHTML.length);

        // set the focus to element 2
        fireEvent.click(text2);
        expect(text2).toHaveFocus();

        // check the text in the box
        expect(textBox1.getText()).toBe('initialText1: hello world');
        // TODO
    });

    it("keyPressAction as stated in textbox should be executed", async () => {
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        const owner1 = screen.getByTestId("mock-text1");
        expect(owner1).toBeVisible();
        const text1 = screen.getByTestId(componentId(textBox1));
        expect(text1).toBeVisible();

        await fireEvent.keyPress(text1, { key: "Enter", code: "Enter", charCode: 13 });
        //  TODO
    });

    it("on click: the caret position is set correctly in the textbox", async () => {
        // TODO
    });

    // maybe this is a way to mock the bounding rectangle
    const p = document.createElement('p')

    p.getBoundingClientRect = jest.fn(() => ({
        x: 851.671875,
        y: 200.046875,
        width: 8.34375,
        height: 17,
        top: 967.046875,
        right: 860.015625,
        bottom: 984.046875,
        left: 851.671875,
        toJSON: undefined,
    }))
    // end mock

    // see also https://stackoverflow.com/questions/55816714/jest-react-mock-scrollby-and-getboundingclientrect-function
});
