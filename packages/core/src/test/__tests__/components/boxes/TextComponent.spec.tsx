import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { AliasBox, PiEditor, TextBox } from "../../../../editor";
import { PiLogger } from "../../../../util";
import { TextComponent } from "../../../../editor/components/boxes";

import { CoreTestActions } from "../../../testeditor/CoreTestActions";
import { CoreTestContext } from "../../../testeditor/CoreTestContext";
import { CoreTestProjection } from "../../../testeditor/CoreTestProjection";

// let n = require("./setup");

describe("TextComponent", () => {
    let nextLeaf: AliasBox;
    let text = "hello projectit";
    let editor: PiEditor;
    let textbox: TextBox;

    beforeEach(() => {
        PiLogger.muteAllLogs();
        const context = new CoreTestContext(null);
        const action = new CoreTestActions();
        const projection = new CoreTestProjection();
        editor = new PiEditor(projection, action);
        editor.rootElement = context.rootElement;

        nextLeaf = new AliasBox(context.rootElement, "", "");
        textbox = new TextBox(
            context.rootElement,
            "",
            () => text,
            t => {
                text = t;
            }
        );
    });

    it("should render the given box", () => {
        const component = mount(<TextComponent {...{ box: textbox, editor: editor }} />);
        expect(component.text()).toBe(text);
    });

    it("should not be editable and not have focus by default", () => {
        const component = mount(<TextComponent {...{ box: textbox, editor: editor }} />);
        expect(hasFocus(component)).toBeFalsy();
    });

    // TODO it.skip gives error message, why?
    // it("should be editable when click", () => {
    //     const component = mount(<TextComponent {...{box: textbox, editor: editor}} />);
    //     component.simulate("click");
    //     expect(hasFocus(component)).toBeTruthy();
    // });
});

function hasFocus(component: ReactWrapper<any, any>): boolean {
    return component.getDOMNode() === document.activeElement;
}
