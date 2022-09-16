import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";

configure({ testIdAttribute: "id" });

import { ModelMaker } from "../models/ModelMaker";
import { OptionalBox, PiCaret, PiCompositeProjection, PiEditor, TextBox } from "@projectit/core";
import { ElementWithText } from "../models/ElementWithText";
import Mock4Text from "../mock-components/Mock4Text.svelte";
import Mock4TextDouble from "../mock-components/Mock4TextDouble.svelte";
import userEvent from "@testing-library/user-event";


describe.skip("TextComponent", () => {

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
        // add parent boxes, because otherwise 'isActionTextBox' throws null pointer
        const parentBox1 = new OptionalBox(model, "parent-role1", () => {return true;}, textBox1, false, "someAliasText" );
        const parentBox2 = new OptionalBox(model, "parent-role2", () => {return true;}, textBox2, false, "someAliasText" );
    });

    it("when empty, placeholder should be present", () => {
        model.myText1 = null;
        textBox1.placeHolder = "PLACEHOLDER";
        render(Mock4Text, { box: textBox1, editor: myEditor });
        const myText = screen.getByText(textBox1.placeHolder);
        expect(myText).toBeVisible(); // there is a placeholder
        expect(myText.getAttribute("text")).toBeNull(); // there is no text, because model.myText = null
        expect(myText).toHaveStyle("opacity: 50%;"); // TODO is there another manner to check whether the text component is empty?
    });

    it("when textbox gets focus: textcomponent gets focus", async () => {
        render(Mock4Text, { box: textBox1, editor: myEditor });
        const myText = screen.getByText(textBox1.getText());
        expect(myText).toBeVisible();
        expect(myText).not.toHaveFocus();

        // set the focus to the textcomponent
        await textBox1.setFocus();
        let myInputField = screen.getByDisplayValue(textBox1.getText()); // getByText does not work for <input>
        expect(myInputField).toBeVisible();
        expect(myInputField).toHaveFocus();
        expect(document.activeElement).toBe(myInputField);
    });

    it("when click outside: textbox loses focus", async () => {
        // this test needs two elements: both SelectableComponents, in order for the click outside to be noticed
        // we need to render first because that makes the textcomponent register the setFocus method with its box
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        await textBox1.setFocus();
        let input1: HTMLInputElement = screen.getByDisplayValue(textBox1.getText()) as HTMLInputElement; // getByText does not work for <input>
        expect(input1).toBeVisible();
        expect(input1).toHaveFocus();
        const text2 = screen.getByText(textBox2.getText());
        expect(text2).not.toHaveFocus();

        // set the focus to element 2
        await fireEvent.click(text2);
        const input2 = screen.getByDisplayValue(textBox2.getText());
        expect(input2).toHaveFocus();
        const text1 = screen.getByText(textBox1.getText());
        expect(text1).not.toHaveFocus();
    });

    it("when textcomponent loses focus and the text is altered, the text should be stored in the box", async () => {
        // this test needs two elements: both SelectableComponents, in order for the click outside to be noticed
        // we need to render first because that makes the textcomponent register the setFocus method with its box
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        // set the focus to the textcomponent
        await textBox1.setFocus();
        let input1: HTMLInputElement = screen.getByDisplayValue(textBox1.getText()) as HTMLInputElement; // getByText does not work for <input>
        expect(input1).toBeVisible();
        expect(input1).toHaveFocus();
        expect(document.activeElement).toBe(input1);

        const text2 = screen.getByText(textBox2.getText());
        expect(text2).not.toHaveFocus();

        // set the caret position
        textBox1.setCaret(PiCaret.RIGHT_MOST);
        expect(input1.selectionStart).toBe(textBox1.getText().length);

        // alter the text
        const user = userEvent.setup();
        // user.type normally clicks before typing, but we need to check the caret position as well, so we skip the click
        await user.type(input1, ': hello world', { skipClick: true }); // TODO does not react to special chars
        expect(input1).toHaveValue('initialText1: hello world');
        // TODO add a test where spaces are ignored
        expect(text2.innerHTML).toBe('initialText2');

        // set the focus to element 2
        await fireEvent.click(text2);
        const input2 = screen.getByDisplayValue(textBox2.getText());
        expect(input2).toHaveFocus();

        // check the text in the box
        expect(textBox1.getText()).toBe('initialText1: hello world');
    });

    it("keyPressAction as stated in textbox should be executed", async () => {
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        const owner1 = screen.getByTestId("mock-text1");
        expect(owner1).toBeVisible();
        const text1 = screen.getByTestId(textBox1.id);
        expect(text1).toBeVisible();

        await fireEvent.keyPress(text1, { key: "Enter", code: "Enter", charCode: 13 });
        // TODO finish this
    });

    it("on click: the caret position is set correctly in the textbox", async () => {
        // jsdom does not support 'getBoundingClientRect', because it does not have a layout engine.
        // Therefore, we cannot test a mouse click on a specific position within the text.
        render(Mock4TextDouble, { box1: textBox1, box2: textBox2, editor: myEditor });
        const text1 = screen.getByText(textBox1.getText());
        await fireEvent.click(text1);
        let input1: HTMLInputElement = screen.getByDisplayValue(textBox1.getText()) as HTMLInputElement; // getByText does not work for <input>
        expect(input1).toBeVisible();
        expect(input1).toHaveFocus();
        expect(document.activeElement).toBe(input1);

        expect(input1.selectionStart).toBe(0);
    });

});
