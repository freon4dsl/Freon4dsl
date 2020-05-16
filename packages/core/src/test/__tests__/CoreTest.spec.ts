import { PiLogger } from "../../util";

import { CoreTestContext } from "../testeditor/CoreTestContext";
import { CoreTestModel } from "../testmodel/CoreTestModel";
import { CoreTestFunction } from "../testmodel/domain/CoreTestFunction";

describe("CoreTest Model", () => {
    describe("container settings", () => {
        let context: CoreTestContext;
        let root: CoreTestModel;

        beforeEach(done => {
            PiLogger.muteAllLogs();
            context = new CoreTestContext();
            root = context.rootElement as CoreTestModel;
            done();
        });

        it(" children should be set at start", () => {
            expect(root.name).toBe("CoreTestModel");
            expect(root.model instanceof CoreTestModel).toBe(true);

            const model = root as CoreTestModel;
            expect(model.entities.length).toBe(2);

            const f: CoreTestFunction = model.entities[0].functions[0];
            expect(f.expression.container).toBe(f);
            expect(f.container).toBe(model.entities[0]);
            expect((f.expression as any).container).toBeTruthy();
            expect(f.expression.piContainer().container).toBe(f);
        });
    });
});
