import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "id" });

import { GridBox, GridCellBox, LabelBox, OptionalBox, PiCompositeProjection, PiEditor, PiElement } from "@projectit/core";
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";

import { ModelMaker } from "../models/ModelMaker";
import { ElementWithOptional } from "../models/ElementWithOptional";
import { SimpleElement } from "../models/SimpleElement";
import { ElementWithManyAttrs } from "../models/ElementWithManyAttrs";
import { ElementForGrid } from "../models/ElementForGrid";
import { MockVariables } from "../mock-components/MockVariables";
import Mock4Optional from "../mock-components/Mock4Optional.svelte";
import Mock4Label from "../mock-components/Mock4Label.svelte";
import Mock4Grid from "../mock-components/Mock4Grid.svelte";
import { RenderComponent } from "../../components";
import { pressKeys } from "./pressKeys";

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

});
