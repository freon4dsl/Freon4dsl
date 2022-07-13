import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import { LabelBox, OptionalBox, PiCompositeProjection, PiEditor, PiElement } from "@projectit/core";
import { MockVariables } from "../mock-components/MockVariables";
import { ModelMaker } from "../models/ModelMaker";
import OptionalComponent from "../../components/OptionalComponent.svelte"; // Note that this form of import is neccessary for jest to function!
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ElementWithOptional } from "../models/ElementWithOptional";
import Mock4Optional from "../mock-components/Mock4Optional.svelte";
import { configure } from '@testing-library/dom'
import Mock4Label from "../mock-components/Mock4Label.svelte";
import { SimpleElement } from "../models/SimpleElement";
configure({ testIdAttribute: 'id' })

describe("Keyboard events are propagated", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    const myEditor = new PiEditor(new PiCompositeProjection(), null);

    it("by label", async () => {
        // create a model and the boxes for the model
        const element: PiElement = new SimpleElement("WHATSINANAME");
        const myLabelBox = new LabelBox(element, "role", () => "LabelText");

        // render the element
        const result = render(Mock4Label, { box: myLabelBox, editor: myEditor });
        const myLabel = screen.getByText('LabelText');
        expect(myLabel).toBeVisible();
        const myEnv = screen.getByTestId("mock-environment");
        expect(myEnv).toBeVisible();

        // test the keys
        await pressKeys(myLabel);
    });

    it("by optional", async () => {
        // create a model and the boxes for the model
        let model: ElementWithOptional = ModelMaker.makeOptional();
        let childBox: LabelBox = new LabelBox(model.myOptional, "optional-element", () => "OptionalLabel");
        let ownerBox: OptionalBox = new OptionalBox(model, "opt-role", () => {return true;}, childBox, true, "someAliasText" );

        // render the optional
        const result = render(Mock4Optional, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myEnv = screen.getByTestId("mock-environment");
        expect(myEnv).toBeVisible();

        // test the keys
        await pressKeys(myOptional);
    });

    it("by text component", async () => {
        // TODO
    });

    async function pressKeys(htmlElement: HTMLElement) {
        // reset MockVariables
        MockVariables.reset();

        // press arrow up
        await fireEvent.keyPress(htmlElement, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        expect(MockVariables.nrKeypress).toBe(1);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "ArrowUp",
            keyCode: 0,
            meta: 0
        });

        // press arrow down
        await fireEvent.keyPress(htmlElement, { key: "ArrowDown", code: "ArrowDown", charCode: 40 });
        expect(MockVariables.nrKeypress).toBe(2);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "ArrowDown",
            keyCode: 0,
            meta: 0
        });

        // press arrow left
        await fireEvent.keyPress(htmlElement, { key: "ArrowLeft", code: "ArrowLeft", charCode: 37 });
        expect(MockVariables.nrKeypress).toBe(3);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "ArrowLeft",
            keyCode: 0,
            meta: 0
        });

        // press arrow right
        await fireEvent.keyPress(htmlElement, { key: "ArrowRight", code: "ArrowRight", charCode: 39 });
        expect(MockVariables.nrKeypress).toBe(4);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "ArrowRight",
            keyCode: 0,
            meta: 0
        });

        // press tab
        await fireEvent.keyPress(htmlElement, { key: "Tab", code: "Tab", charCode: 9, shiftKey: false });
        expect(MockVariables.nrKeypress).toBe(5);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "Tab",
            keyCode: 0,
            meta: 0
        });

        // press shift tab
        await fireEvent.keyPress(htmlElement, { key: "Tab", code: "Tab", charCode: 9, shiftKey: true });
        // console.log(`AFTER MockVariables keyPress: ${MockVariables.nrKeypress}, keyDown: ${MockVariables.nrKeydown}, keyUp: ${MockVariables.nrKeyup}`)
        expect(MockVariables.nrKeypress).toBe(6);
        expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
            code: "Tab",
            keyCode: 0,
            meta: 3
        });
    }
});
