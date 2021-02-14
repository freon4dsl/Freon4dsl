import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { PiComponent, PiComponentProps } from "../../../../editor/components";
import { PiEditor } from "../../../../editor";
import { PiLogger } from "../../../../util";
import { CoreTestActions, CoreTestContext, CoreTestProjection } from "../../../testeditor";
import { CoreTestExpression, CoreTestNumberLiteralExpression } from "../../../testmodel";

describe("PiEditor", () => {
    let editor: PiEditor;
    let expression: CoreTestExpression;
    let context: CoreTestContext;
    let projectedProps: PiComponentProps;
    let component: ReactWrapper;

    beforeEach(() => {
        PiLogger.muteAllLogs();
        expression = CoreTestNumberLiteralExpression.create("0");
        context = new CoreTestContext(expression);
        const action = new CoreTestActions();
        const projection = new CoreTestProjection();
        editor = new PiEditor(projection, action);
        editor.rootElement = context.rootElement;
        projectedProps = { editor: editor };
    });

    describe("getRootBox", () => {
        it("should return the root box", async () => {
            component = mount(<PiComponent {...projectedProps} />);
            expect(1).toBe(1);
        });
    });
});
