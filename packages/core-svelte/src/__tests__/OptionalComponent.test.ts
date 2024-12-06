import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { FreProjectionHandler, LabelBox, OptionalBox, FreEditor } from "@freon4dsl/core";
import { MockVariables } from "./mock-components/MockVariables.js";
import { ModelMaker } from "./models/ModelMaker.js";
import OptionalComponent from "../lib/components/OptionalComponent.svelte"; // Note that this form of import is neccessary for jest to function!
import { ElementWithOptional } from "./models/ElementWithOptional.js";
import TestOptional from "./mock-components/TestOptional.svelte";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "id" });

describe.skip("Optional component", () => {
    let model: ElementWithOptional;
    let ownerBox: OptionalBox;
    let childBox: LabelBox;
    const myEditor = new FreEditor(new FreProjectionHandler(), null);

    beforeEach(() => {
        // create a model and the boxes for the model
        model = ModelMaker.makeOptional();
        childBox = new LabelBox(model.myOptional, "optional-element", () => "OptionalLabel");
    });

    it("condition true, mustShow false => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(
            model,
            "opt-role",
            () => {
                return true;
            },
            childBox,
            false,
            "someAliasText",
        );
        const result = render<OptionalComponent>(OptionalComponent, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition true, mustShow true => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(
            model,
            "opt-role",
            () => {
                return true;
            },
            childBox,
            true,
            "someAliasText",
        );
        const result = render<OptionalComponent>(OptionalComponent, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition false, mustShow true => optional is visible, alias not", () => {
        ownerBox = new OptionalBox(
            model,
            "opt-role",
            () => {
                return false;
            },
            childBox,
            true,
            "someAliasText",
        );
        const result = render<OptionalComponent>(OptionalComponent, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).toBeNull();
    });

    it("condition false, mustShow false => alias is visible, optional is not visible", () => {
        ownerBox = new OptionalBox(
            model,
            "opt-role",
            () => {
                return false;
            },
            childBox,
            false,
            "someAliasText",
        );
        const result = render<OptionalComponent>(OptionalComponent, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.queryByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeNull();
        const myAlias = screen.queryByTestId("OPTIONAL-OWNER-alias-opt-role-textbox");
        expect(myAlias).not.toBeNull();
        expect(myAlias).toBeVisible();
    });

    it("all keyboard events are propagated when optional is visible", async () => {
        ownerBox = new OptionalBox(
            model,
            "opt-role",
            () => {
                return true;
            },
            childBox,
            true,
            "someAliasText",
        );
        const result = render<TestOptional>(TestOptional, { box: ownerBox, editor: myEditor });
        const myOwner = screen.getByTestId("OPTIONAL-OWNER-opt-role");
        expect(myOwner).toBeVisible();
        const myOptional = screen.getByTestId("OPTIONAL_ELEMENT-optional-element");
        expect(myOptional).toBeVisible();
        const myEnv = screen.getByTestId("mock-environment");
        expect(myEnv).toBeVisible();
        // expect(() => getByLabelText('another button')).not.toThrow();
        // set up mock function
        const handleKeyStroke = jest.fn();

        // result.component.$on("keydown", handleKeyStroke) // Bind mock function to keydown event using Svelte component API
        result.component.$on("keypress", handleKeyStroke); // Bind mock function to keypress event using Svelte component API
        // press arrow up
        await fireEvent.keyPress(myOptional, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
        expect(MockVariables.nrKeypress).toBe(1);
        expect(MockVariables.nrKeydown).toBe(0);
        // expect(handleKeyStroke).toHaveBeenCalledTimes(1);
    });
});
