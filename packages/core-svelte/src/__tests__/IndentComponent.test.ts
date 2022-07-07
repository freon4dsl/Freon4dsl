import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/svelte";
import { IndentBox, LabelBox, PiEditor, PiElement } from "@projectit/core";
import { SimpleElement } from "./models/SimpleElement";
import IndentComponent from "../components/IndentComponent.svelte";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' })


describe("Indent component", () => {
    // an indent box coupled to element2, that takes as slot:
    // a label box coupled to element1
    const element1: PiElement = new SimpleElement("WHATSINANAME");
    const element2: PiElement = new SimpleElement("ANOTHERNAME");
    const myEditor = new PiEditor(null, null);
    const myLabelBox = new LabelBox(element1, "role", () => "LabelText");
    const myIndentBox = new IndentBox(element2,"indent-role", 4, myLabelBox);

    it(", with label as slot, is indented", () => {
        const result = render(IndentComponent, { indentBox: myIndentBox, editor: myEditor });
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();
        const indentComp = screen.getByTestId(`${myIndentBox.element.piId()}-${myIndentBox.role}`);
        // Cannot test the dynamic value of margin-left TODO find out how to
        // For now, we test the static value of margin-left
        expect(indentComp).toHaveStyle('margin-left: 50px');
        // and ... the dynamic value of 'style' in the Svelte component
        // Note, that 'style' needs to be exported from IndentComponent for this to work.
        const xxx = result.component;
        expect(xxx.style).toBe("32px;");
    });

});
