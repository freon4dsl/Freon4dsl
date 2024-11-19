import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { LabelBox, FreEditor, type FreNode } from "@freon4dsl/core";
import { SimpleElement } from "./models/SimpleElement.js";
import LabelComponent from "../lib/components/LabelComponent.svelte";
import MockLabelSelectable from "./mock-components/MockLabelSelectable.svelte";

describe.skip("Label component", () => {
    const element: FreNode = new SimpleElement("WHATSINANAME");
    const myLabelBox = new LabelBox(element, "role", () => "LabelText");
    const element2: FreNode = new SimpleElement("ANOTHERNAME");
    const secondLabelBox = new LabelBox(element2, "role2", () => "AnotherText");
    const myEditor = new FreEditor(null, null);

    it("is rendered with label", () => {
        render<LabelComponent>(LabelComponent, { box: myLabelBox });
        const myLabel = screen.getByText("LabelText");
        expect(myLabel).toBeVisible();
        myLabelBox.setFocus();
        expect(myLabel).toHaveFocus();
    });

    it("gets focus from its box", () => {
        render<LabelComponent>(LabelComponent, { box: myLabelBox });
        const myLabel = screen.getByText("LabelText");
        expect(myLabel).toBeVisible();
        myLabelBox.setFocus();
        expect(myLabel).toHaveFocus();
    });

    it("gets focus when clicked", () => {
        // the SelectableComponent listens to mouse clicks,
        // therefore we test this using a wrapper 'TestLabelSelectable'
        render<MockLabelSelectable>(MockLabelSelectable, { box1: myLabelBox, box2: secondLabelBox });
        const myContainer1 = screen.getByTestId("test-label1");
        expect(myContainer1).toBeVisible();
        const myLabel = screen.getByText("LabelText");
        expect(myLabel).toBeVisible();

        fireEvent.click(myContainer1);
        expect(myLabel).not.toHaveFocus();

        expect(myLabelBox.selectable).toBeTruthy();

        fireEvent.click(myLabel);
        expect(myLabel).toHaveFocus();
    });

    it("loses focus when another label is clicked", () => {
        // the SelectableComponent listens to mouse clicks,
        // therefore we test this using a wrapper 'MockLabelSelectable'
        render<MockLabelSelectable>(MockLabelSelectable, { box1: myLabelBox, box2: secondLabelBox });
        const myContainer1 = screen.getByTestId("test-label1");
        expect(myContainer1).toBeVisible();
        const myLabel = screen.getByText("LabelText");
        expect(myLabel).toBeVisible();

        fireEvent.click(myLabel);
        expect(myLabel).toHaveFocus();

        const myContainer2 = screen.getByTestId("test-label2");
        expect(myContainer2).toBeVisible();
        const myLabel2 = screen.getByText("AnotherText");
        expect(myLabel2).toBeVisible();

        fireEvent.click(myLabel2);
        expect(myLabel2).toHaveFocus();
        expect(myLabel).not.toHaveFocus();
    });
});
