import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import mountToJson, { Json } from "enzyme-to-json";

import { PiEditor, PiComponentProps, PiLogger, ProjectionalEditor } from "@projectit/core";
import { DemoActions } from "../../editor/DemoActions";
import { DemoContext } from "../../editor/DemoContext";
import { DemoProjection } from "../../editor/DemoProjection";
import { DemoNumberLiteralExpression } from "../../model/expressions/DemoNumberLiteralExpression";

describe("ProjectionalEditor", () => {
    let props: PiComponentProps;
    let context: DemoContext;
    let editor: PiEditor;

    beforeEach(() => {
        PiLogger.muteAllLogs();
        context = new DemoContext(DemoNumberLiteralExpression.create("1"));
        const action = new DemoActions();
        const projection = new DemoProjection();
        editor = new PiEditor(context, projection, action);
        const rootBox = projection.getBox(context.rootElement);
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
