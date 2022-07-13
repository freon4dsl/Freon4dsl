import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/svelte";
import { configure } from '@testing-library/dom';
configure({ testIdAttribute: 'id' });

import { LabelBox, OptionalBox, PiCompositeProjection, PiEditor } from "@projectit/core";
import { ModelMaker } from "../models/ModelMaker";
import OptionalComponent from "../../components/OptionalComponent.svelte"; // Note that this form of import is neccessary for jest to function!
import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "../../components/ChangeNotifier";
import { ElementWithOptional } from "../models/ElementWithOptional";

describe("Optional component", () => {
    MOUNT_LOGGER.mute();
    AUTO_LOGGER.mute();
    UPDATE_LOGGER.mute();
    FOCUS_LOGGER.mute();

    let model: ElementWithOptional;
    let ownerBox: OptionalBox;
    let childBox: LabelBox;
    const myEditor = new PiEditor(new PiCompositeProjection(), null);

    beforeEach(() => {
        // create a model and the boxes for the model
        model = ModelMaker.makeOptional();
        childBox = new LabelBox(model.myOptional, "optional-element", () => "OptionalLabel");
    });

    it("condition true, mustShow false => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(model, "opt-role", () => {return true;}, childBox, false, "someAliasText" );
        const result = render(OptionalComponent, { optionalBox: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition true, mustShow true => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(model, "opt-role", () => {return true;}, childBox, true, "someAliasText" );
        const result = render(OptionalComponent, { optionalBox: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition false, mustShow true => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(model, "opt-role", () => {return false;}, childBox, true, "someAliasText" );
        const result = render(OptionalComponent, { optionalBox: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition false, mustShow false => alias is visible, optional is not visible", () => {
        ownerBox = new OptionalBox(model, "opt-role", () => {return false;}, childBox, false, "someAliasText" );
        const result = render(OptionalComponent, { optionalBox: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.queryByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeNull();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).not.toBeNull();
        expect(myAlias).toBeVisible();
    });
});
