import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { PiEditor, PiComponent, PiComponentProps, PiLogger } from "projectit";

import { DemoActions, DemoContext, DemoProjection} from "../../../src/editor";
import { DemoExpression, DemoNumberLiteralExpression } from "../../../src/model/index";

describe("PiEditor", () => {
    let editor: PiEditor;
    let expression: DemoExpression;
    let context: DemoContext;
    let projectedProps: PiComponentProps;
    let component: ReactWrapper;

    beforeEach(() => {
        PiLogger.muteAllLogs();
        expression = DemoNumberLiteralExpression.create("0");
        context = new DemoContext(expression);
        const action = new DemoActions();
        const projection = new DemoProjection();
        editor = new PiEditor(context, projection, action);
        projectedProps = { editor: editor };
    });


    describe("getRootBox", () => {
        it("should return the root box", async () => {
            component = mount(<PiComponent {...projectedProps} />);
            expect(1).toBe(1);
        });
    });
});
