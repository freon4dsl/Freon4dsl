import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/svelte";
import { IndentBox, LabelBox, FreEditor, type FreNode } from "@freon4dsl/core";
import { SimpleElement } from "./models/SimpleElement.js";
import IndentComponent from "../lib/components/IndentComponent.svelte";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "id" });

describe.skip("Indent component", () => {
    // an indent box coupled to element2, that takes as slot:
    // a label box coupled to element1
    const element1: FreNode = new SimpleElement("WHATSINANAME");
    const element2: FreNode = new SimpleElement("ANOTHERNAME");
    const myEditor = new FreEditor(null, null);
    const myLabelBox = new LabelBox(element1, "role", () => "LabelText");
    const myIndentBox = new IndentBox(element2, "indent-role", 4, myLabelBox);

    it(", with label as slot, is indented", () => {
        const result = render<IndentComponent>(IndentComponent, { box: myIndentBox, editor: myEditor });
        const myLabel = screen.getByText("LabelText");
        expect(myLabel).toBeVisible();
        const indentComp = screen.getByTestId(`${myIndentBox.node.freId()}-${myIndentBox.role}`);
        // Cannot test the dynamic value of margin-left TODO find out how to
        // For now, we test the static value of margin-left
        // TODO: This seems to work now, probably newer versions
        expect(indentComp).toHaveStyle("margin-left: 32px");
        // and ... the dynamic value of 'style' in the Svelte component
        // Note, that 'style' needs to be exported from IndentComponent for this to work.
        const xxx = result.component;
        expect(xxx.style).toBe("margin-left: 32px;");
    });
});
