import { PiLogger } from "@projectit/core";

import { DemoContext } from "../editor/DemoContext";
import { DemoModel } from "../model/DemoModel";
import { DemoFunction } from "../model/domain/DemoFunction";

// describe.skip("Demo Model", () => {
//     describe("container settings", () => {
//         let context: DemoContext;
//         let root: DemoModel;
//
//         beforeEach(done => {
//             PiLogger.muteAllLogs();
//             context = new DemoContext();
//             root = context.rootElement as DemoModel;
//             done();
//         });
//
//         it(" children should be set at start", () => {
//             expect(root.name).toBe("DemoModel");
//             expect(root.model instanceof DemoModel).toBe(true);
//
//             const model = root as DemoModel;
//             expect(model.functions.length).toBe(3);
//
//             const f: DemoFunction = model.functions[0];
//             expect(f.expression.container).toBe(f);
//             expect(f.container).toBe(model);
//             expect((f.expression as any).container).toBeTruthy();
//             expect(f.expression.piContainer().container).toBe(f);
//         });
//     });
// });
