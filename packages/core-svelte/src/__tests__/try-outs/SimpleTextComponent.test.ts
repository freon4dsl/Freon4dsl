import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";

configure({ testIdAttribute: "id" });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { OptionalBox, PiCompositeProjection, PiEditor, TextBox } from "@projectit/core";
import { ElementWithText } from "../models/ElementWithText";
import { ModelMaker } from "../models/ModelMaker";
import { componentId } from "../../components/util";
import UseSimpleText from "./UseSimpleText.svelte";


describe("SimpleTextComponent", () => {
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
        render(UseSimpleText, { box1: textBox1, box2: textBox2, editor: myEditor });
        const myText = screen.getByTestId(componentId(textBox1));
        expect(myText).toBeVisible();
        const placeH = screen.queryByPlaceholderText(textBox1.placeHolder);
        expect(placeH).toBe(myText); // there is a placeholder
        expect(myText.getAttribute("value")).toBeNull(); // there is no text, because model.myText = null
        // testing style seems to be a problem
    });

    it("when textbox gets focus: textcomponent gets focus", () => {
        render(UseSimpleText, { box1: textBox1, box2: textBox2, editor: myEditor });
        const myOwner = screen.getByTestId("mock-text1");
        expect(myOwner).toBeVisible();
        const myText = screen.getByTestId(componentId(textBox1));
        expect(myText).toBeVisible();
        expect(myText).not.toHaveFocus();

        // set the focus to the textcomponent
        textBox1.setFocus();
        expect(myText).toHaveFocus();
        expect(document.activeElement).toBe(myText);
    });

    it("when click outside: textbox loses focus", async () => {
        render(UseSimpleText, { box1: textBox1, box2: textBox2, editor: myEditor });
        const owner1 = screen.getByTestId("mock-text1");
        expect(owner1).toBeVisible();
        const text1 = screen.getByTestId(componentId(textBox1));
        expect(text1).toBeVisible();
        expect(text1).toHaveProperty("value", 'initialText1');
        expect(text1).not.toHaveFocus();

        await fireEvent.click(text1);
        expect(text1).toHaveFocus();

        // click on other element
        const text2 = screen.getByTestId(componentId(textBox2));
        expect(text2).toBeVisible();
        await fireEvent.click(text2);
        expect(text1).not.toHaveFocus();
    });

    it("when textcomponent loses focus and the text is altered, the text should be stored in the box", async () => {
        render(UseSimpleText, { box1: textBox1, box2: textBox2, editor: myEditor });
        const text1 = screen.getByTestId(componentId(textBox1));
        const text2 = screen.getByTestId(componentId(textBox2));
        expect(text1).toHaveProperty("value", 'initialText1');
        expect(text2).toHaveProperty("value", 'initialText2');

        // set the focus
        await fireEvent.click(text1);
        expect(text1).toHaveFocus();

        // alter the text
        await fireEvent.change(text1, {target: {value: 'hello world'}});

        expect(text1).toHaveProperty("value", 'hello world');
        expect(text2).toHaveProperty("value", 'initialText2');
        (text1 as HTMLTextAreaElement).value = "XXXX";
        // set the focus to element 2
        await fireEvent.click(text2);
        expect(text2).toHaveFocus();

        // check the text in the box
        expect(textBox1.getText()).toBe('hello world');
        expect(textBox2.getText()).toBe('initialText2');
    });
});

