import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import mountToJson, { Json } from "enzyme-to-json";

import { PiEditor } from "../../../editor";
import { PiLogger } from "../../../util";
import { CoreTestActions } from "../../testeditor/CoreTestActions";
import { CoreTestContext } from "../../testeditor/CoreTestContext";
import { CoreTestProjection } from "../../testeditor/CoreTestProjection";
import { CoreTestNumberLiteralExpression } from "../../testmodel/expressions/CoreTestNumberLiteralExpression";
import { PiComponentProps, ProjectionalEditor } from "../../../editor/components";

describe("ProjectionalEditor", () => {
    let props: PiComponentProps;
    let context: CoreTestContext;
    let editor: PiEditor;

    beforeEach(() => {
        PiLogger.muteAllLogs();
        context = new CoreTestContext(CoreTestNumberLiteralExpression.create("1"));
        const action = new CoreTestActions();
        const projection = new CoreTestProjection();
        editor = new PiEditor(projection, action);
        editor.rootElement = context.rootElement;

        const rootBox = projection.getBox(editor.rootElement);
        props = {
            editor: editor
        };
    });

    it("should render NumberLiteralExpression", () => {
        const component = mount(<ProjectionalEditor {...props} />);

        // TODO  TS2339: Property 'toMatchSnapshot' does not exist on type 'Matchers<Json>'.
        // expect(toJson(component)).toMatchSnapshot();
    });
});

export function toJson(component: ReactWrapper<any, any>): Json {
    return mountToJson(component, {
        noKey: true,
        mode: "deep"
        // map: noComponentProps
    });
}
