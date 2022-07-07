import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import { LabelBox, PiEditor, PiElement } from "@projectit/core";
import { SimpleElement } from "../models/SimpleElement";
import LabelComponent from "../../components/LabelComponent.svelte";
import TestLabelSelectable from "./TestLabelSelectable.svelte";

describe("Label component", () => {
    const element: PiElement = new SimpleElement("WHATSINANAME");
    const myLabelBox = new LabelBox(element, "role", () => "LabelText");
    const element2: PiElement = new SimpleElement("ANOTHERNAME");
    const secondLabelBox = new LabelBox(element2, "role2", () => "AnotherText");
    const myEditor = new PiEditor(null, null);

    it("is rendered with label", () => {
        render(LabelComponent, { label: myLabelBox, editor: myEditor });
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();
        myLabelBox.setFocus();
        expect(myLabel).toHaveFocus();
    });

    it("gets focus from its box", () => {
        render(LabelComponent, { label: myLabelBox, editor: myEditor });
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();
        myLabelBox.setFocus();
        expect(myLabel).toHaveFocus();
    });

    it("gets focus when clicked", () => {
        // the SelectableComponent listens to mouse clicks,
        // therefore we test this using a wrapper 'TestLabelSelectable'
        render(TestLabelSelectable, {box1: myLabelBox, box2: secondLabelBox, editor: myEditor})
        const myContainer1 = screen.getByTestId('test-label1');
        expect(myContainer1).toBeVisible();
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();

        fireEvent.click(myContainer1);
        expect(myLabel).not.toHaveFocus();

        fireEvent.click(myLabel);
        expect(myLabel).toHaveFocus();
    });

    it("loses focus when another label is clicked", () => {
        // the SelectableComponent listens to mouse clicks,
        // therefore we test this using a wrapper 'TestLabelSelectable'
        render(TestLabelSelectable, {box1: myLabelBox, box2: secondLabelBox, editor: myEditor})
        const myContainer1 = screen.getByTestId('test-label1');
        expect(myContainer1).toBeVisible();
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();

        fireEvent.click(myLabel);
        expect(myLabel).toHaveFocus();

        const myContainer2 = screen.getByTestId('test-label2');
        expect(myContainer2).toBeVisible();
        const myLabel2 = screen.getByText('AnotherText');
        expect(myLabel2).toBeVisible();

        fireEvent.click(myLabel2);
        expect(myLabel2).toHaveFocus();
        expect(myLabel).not.toHaveFocus();
    });
});
