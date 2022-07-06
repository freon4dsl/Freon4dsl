import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/svelte";
import { IndentBox, LabelBox, PiEditor, PiElement } from "@projectit/core";
import { SimpleElement } from "../models/SimpleElement";
import RenderComponent from "../../components/RenderComponent.svelte";

describe("Render component", () => {
    // an indent box coupled to element2, that takes as slot
    // a label box coupled to element1
    const element1: PiElement = new SimpleElement("WHATSINANAME");
    const element2: PiElement = new SimpleElement("ANOTHERNAME");
    const myEditor = new PiEditor(null, null);
    const myLabelBox = new LabelBox(element1, "role", () => "LabelText");
    const myIndentBox = new IndentBox(element2,"indent-role", 4, myLabelBox);

    it("with label as slot", () => {
        const result = render(RenderComponent, { box: myLabelBox, editor: myEditor });
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();
        expect(myLabel).not.toHaveFocus();
    });

});
