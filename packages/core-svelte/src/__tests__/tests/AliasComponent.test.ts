import '@testing-library/jest-dom';
import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { configure } from '@testing-library/dom'
configure({ testIdAttribute: 'id' });

import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ElementWithOptional } from "../models/ElementWithOptional";
import { AliasBox, LabelBox, OptionalBox, PiCompositeProjection, PiEditor } from "@projectit/core";
import { ModelMaker } from "../models/ModelMaker";
import OptionalComponent from "../../components/OptionalComponent.svelte";
import { AliasComponent } from "../../components";

describe("AliasComponent", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let model: ElementWithOptional;
    let aliasBox: AliasBox;
    let optionalBox: OptionalBox;
    let childBox: LabelBox;
    const myEditor = new PiEditor(new PiCompositeProjection(), null);

    beforeEach(() => {
        // create a model and the boxes for the model
        model = ModelMaker.makeOptional();
        childBox = new LabelBox(model.myOptional, "optional-element", () => "OptionalLabel");
        optionalBox = new OptionalBox(model, "opt-role", () => {return true;}, childBox, false, "someAliasText" );
        aliasBox = optionalBox.whenNoShowingAlias;
    });

    it("on click: dropdown is visible", async () => {
        const result = render(AliasComponent, { choiceBox: aliasBox, editor: myEditor });
        const myOwner = screen.getByTestId("alias-OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();

        fireEvent.click(myOwner);
        // expect(myOwner).toBeNull();
    // TODO
    });

    it("on entry through keyboard no dropdown is shown", () => {
        // TODO
    });

    it("ctr-space : toggle drop down", () => {
        // TODO
    });

    it("when text is entered in text box then the options in drop down are filtered accordingly", () => {
        //  TODO
    });

    it("when text entered in text box is equal to option, this option is selected and its alias action is executed", () => {
        // TODO
    });

    it("place holder is shown if text field is empty", () => {
        // TODO
    });

    it("when nothing is selected from drop down options and component loses focus then dropdown should be closed", () => {
        //  TODO
    });

    it("when nothing is selected from drop down options and component loses focus then textcomponent should be empty", () => {
        // TODO question: why empty and not the previous value
        // TODO
    });

    it("when drop down is visible then arrow up and down keys should be handled by dropdown", () => {
        // TODO
    });

    it("escape key closes dropdown", () => {
        //  TODO
    });
});
