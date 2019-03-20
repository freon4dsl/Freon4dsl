import { observe, reaction } from "mobx";
import {} from "jasmine";
import { PiLogger } from "projectit";

import { DemoContext } from "../src/editor/DemoContext";
import { DemoModel, DemoModelElement } from "../src/model/DemoModel";
import { DemoFunction } from "../src/model/domain/DemoFunction";

describe("Demo Model", () => {
    describe("container settings", () => {
        let context: DemoContext;
        let root: DemoModel;

        beforeEach(done => {
            PiLogger.muteAllLogs();
            context = new DemoContext();
            root = context.rootElement as DemoModel;
            done();
        });

        it(" children should be set at start", () => {
            expect(root.name).toBe("Demo model");
            expect(root.model instanceof DemoModel).toBe(true);

            const model = root as DemoModel;
            expect(model.functions.length).toBe(3);

            const f: DemoFunction = model.functions[0];
            expect(f.expression.container).toBe(f);
            expect(f.container).toBe(model);
            expect((f.expression as any).container).toBeTruthy();
            expect(f.expression.piContainer().container).toBe(f);
        });

    });
});
