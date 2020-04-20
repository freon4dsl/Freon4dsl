import { DemoEnvironment } from "../environment/gen/DemoEnvironment";
import { DemoEntity, DemoFunction, DemoModel } from "../language/gen";
import { GenericModelSerializer } from "@projectit/core";
import { JsonModelCreator } from "./JsonModelCreator";
import { DemoModelCreator } from "./DemoModelCreator";

describe("Demo Model", () => {
    describe("Checking DemoModel instance", () => {
        DemoEnvironment.getInstance();
        let initialModel: DemoModel = new JsonModelCreator().model;
        // let initialModel: DemoModel = new DemoModelCreator().model;

        beforeEach(done => {
            done();
        });

        test("model name should be set", () => {
            expect(initialModel.name).not.toBeNull;
            const serial = new GenericModelSerializer();
            const jsonOut = serial.convertToJSON(initialModel);
            // console.log(JSON.stringify(jsonOut));

            const typescript = serial.toTypeScriptInstance(jsonOut);
            // console.log("typescript  type: " + typescript["$typename"]);

            const inModel = typescript as DemoModel;
            // console.log("inModel type: " + inModel.piLanguageConcept() + "  and name " + inModel.name + " id "+ inModel.$id);
            expect(typescript instanceof DemoModel).toBeTruthy();
            expect(typescript instanceof DemoFunction).toBeFalsy();
            expect(inModel.name).toBe("DemoModel_1");

            expect(inModel.entities.length).toBe(2);
            const e1: DemoEntity = inModel.entities[0];
            // expect(e1.container).toBe(inModel);
            expect(e1.name).not.toBeNull;
            expect(e1.name).toBe("Person");
            // expect(e1.functions.length).toBe(1);
            // expect(inModel.functions.length).toBe(3);
            expect(e1.piLanguageConcept()).toBe("DemoEntity");
        });

        // test("model functions should be set correctly", () => {
        //     expect(model.functions.length).toBe(3);
        // });
        //
        // test("model entities should be set correctly", () => {
        //     expect(model.entities.length).toBe(2);
        //
        //     const f1: DemoEntity = model.entities[0];
        //     expect(f1.container).toBe(model);
        //     expect(f1.name).not.toBeNull;
        // });
        //
        // test("entity attributes should be set correctly", () => {
        //   for (let i of model.entities) {
        //     for (let a of i.attributes) {
        //       expect(a.name).not.toBeNull;
        //       expect(a.container).toBe(i);
        //     }
        //   }
        // });
    });
});
