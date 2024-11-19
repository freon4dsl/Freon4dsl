import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { HorizontalListBox, LabelBox, FreEditor } from "@freon4dsl/core";
import { ModelMaker } from "./models/ModelMaker.js";
import ListComponent from "../lib/components/ListComponent.svelte"; // Note that this form of import is neccessary for jest to function!

describe.skip("List component", () => {
    let horizontalBox: HorizontalListBox;
    const myEditor = new FreEditor(null, null);

    beforeEach(() => {
        // create a model and the boxes for the model
        const model = ModelMaker.makeList();
        const boxes: LabelBox[] = [];
        model.myList.forEach((xx, index) => {
            boxes[index] = new LabelBox(xx, "list-element" + index, () => "Label" + index);
        });
        horizontalBox = new HorizontalListBox(model, "", "", boxes);
    });

    it("all elements are visible", () => {
        const result = render<ListComponent>(ListComponent, { box: horizontalBox, editor: myEditor });
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            expect(myLabel).toBeVisible();
        });
    });

    it("when clicked, a single element gets focus", () => {
        const result = render<ListComponent>(ListComponent, { box: horizontalBox, editor: myEditor });
        // nothing has focus before the click
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            expect(myLabel).not.toHaveFocus();
        });
        // click the list
        fireEvent.click(result.container);
        // nothing has focus
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            expect(myLabel).not.toHaveFocus();
        });
        // click the second element
        fireEvent.click(screen.getByText("Label1"));
        // the second element has focus
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            if (index !== 1) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });
    });

    it("using arrow keys, another element gets focus", () => {
        const result = render<ListComponent>(ListComponent, { box: horizontalBox, editor: myEditor });
        // click the second element
        fireEvent.click(screen.getByText("Label1"));
        // the second element has focus
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            if (index !== 1) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });
        // set the focus programmatically on the first element
        horizontalBox.children[0].setFocus();
        // the first element has focus
        horizontalBox.children.forEach((box, index) => {
            const myLabel = screen.getByText("Label" + index);
            if (index !== 0) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });

        // TODO the following only works when the html element is embedded in a FreonComponent
        // // use an arrow key to get to the first element
        // fireEvent.keyPress(document, {key: 'ArrowUp', code: 'ArrowUp',charCode: 38});
        // // the first element has focus
        // horizontalBox.children.forEach((box , index)=> {
        //     const myLabel = screen.getByText('Label' + index);
        //     if (index !== 0) {
        //         expect(myLabel).not.toHaveFocus();
        //     } else {
        //         expect(myLabel).toHaveFocus();
        //     }
        // });
    });
});
