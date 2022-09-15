import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "id" });

import { ModelMaker } from "../models/ModelMaker";
import { OptionalBox, PiCaret, PiCompositeProjection, PiEditor, TextBox } from "@projectit/core";
import { ElementWithText } from "../models/ElementWithText";
import Mock4Text from "../mock-components/Mock4Text.svelte";
import { componentId } from "../../components/svelte-utils";
import Mock4TextDouble from "../mock-components/Mock4TextDouble.svelte";
import userEvent from "@testing-library/user-event";

describe.skip("TextDropdownComponent", () => {
    // TODO create the tests for the dropdown

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

    it("1. when empty, placeholder should be present", () => {
    });

    it("2. when choicebox gets focus through click: textcomponent gets focus, dropdown is shown", async () => {
    });

    it("2. when choicebox gets focus through keyboard: textcomponent gets focus, dropdown is NOT shown", async () => {
    });

    it("3. when text is entered, dropdown is shown and the option list is filtered", async () => {
    });

    it("4. when text is equal to one single option, this option is selected", async () => {
    });

    it("5. arrow up and down select another option in dropdown", async () => {
    });

    it("6. on enter key: current option is selected and choicebox loses focus", async () => {
    });

    it("7. when click outside: choicebox loses focus and no action is executed, previous value restored", async () => {
    });

    it("8. on escape key: dropdown no longer shown", async () => {
    });
});
