import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import { LabelBox, OptionalBox, PiEditor } from "@projectit/core";
import { ModelMaker } from "../models/ModelMaker";
import OptionalComponent from "../../components/OptionalComponent.svelte"; // Note that this form of import is neccessary for jest to function!
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' })

describe("Optional component", () => {
    let optionalBox: OptionalBox;
    const myEditor = new PiEditor(null, null);
    let showIt: boolean = true;

    beforeEach(() => {
        // create a model and the boxes for the model
        const model = ModelMaker.makeOptional();
        const box: LabelBox = new LabelBox(model.myOptional, "optional-element", () => "OptionalLabel");
        optionalBox = new OptionalBox(model, "opt-role", () => {return showIt;}, box, false, "someAliasText" );
    });

    it.skip("all elements are visible", () => {
        const result = render(OptionalComponent, { optionalBox: optionalBox, editor: myEditor });
        expect(result.container).toBeNull();
        // horizontalBox.children.forEach((box , index)=> {
        //     const myLabel = screen.getByText('Label' + index);
        //     expect(myLabel).toBeVisible();
        // });
    });

    it.skip("when clicked, a single element gets focus", () => {
        const result = render(OptionalComponent, { list: optionalBox, editor: myEditor });
        // nothing has focus before the click
        optionalBox.children.forEach((box , index)=> {
            const myLabel = screen.getByText('Label' + index);
            expect(myLabel).not.toHaveFocus();
        });
        // click the list
        fireEvent.click(result.container);
        // nothing has focus
        optionalBox.children.forEach((box , index)=> {
            const myLabel = screen.getByText('Label' + index);
            expect(myLabel).not.toHaveFocus();
        });
        // click the second element
        fireEvent.click(screen.getByText('Label1'));
        // the second element has focus
        optionalBox.children.forEach((box , index)=> {
            const myLabel = screen.getByText('Label' + index);
            if (index !== 1) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });
    });

    it.skip("using arrow keys, another element gets focus", () => {
        const result = render(OptionalComponent, { list: optionalBox, editor: myEditor });
        // click the second element
        fireEvent.click(screen.getByText('Label1'));
        // the second element has focus
        optionalBox.children.forEach((box , index)=> {
            const myLabel = screen.getByText('Label' + index);
            if (index !== 1) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });
        // set the focus programmatically on the first element
        optionalBox.children[0].setFocus();
        // the first element has focus
        optionalBox.children.forEach((box , index)=> {
            const myLabel = screen.getByText('Label' + index);
            if (index !== 0) {
                expect(myLabel).not.toHaveFocus();
            } else {
                expect(myLabel).toHaveFocus();
            }
        });

        // TODO the following only works when the html element is embedded in a ProjectItComponent
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
