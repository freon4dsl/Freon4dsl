import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { DemoEntity, DemoFunction, DemoModel } from "../language/gen";
import { FreModelSerializer } from "@projectit/core";
import { JsonModelCreator } from "./JsonModelCreator";

describe("Checking Serializer on Demo", () => {
    DemoEnvironment.getInstance();
    let initialModel: DemoModel = new JsonModelCreator().model;

    beforeEach(done => {
        done();
    });

    test("model-to-json, followed by json-to-model should result in same model", () => {
        expect(initialModel.name).not.toBeNull();
        const serial = new FreModelSerializer();
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
        // expect(e1.owner).toBe(inModel);
        expect(e1.name).not.toBeNull();
        expect(e1.name).toBe("Person");
        expect(e1.functions.length).toBe(0);
        expect(inModel.functions.length).toBe(1);
        expect(e1.piLanguageConcept()).toBe("DemoEntity");
    });

    test("storing public only, with only 'name', 'function', and 'main' properties in DemoModel declared public", () => {
        expect(initialModel.name).not.toBeNull();
        const serial = new FreModelSerializer();
        const jsonOut = serial.convertToJSON(initialModel, true);
        // console.log(JSON.stringify(jsonOut));

        if (!!jsonOut) {
            const typescript = serial.toTypeScriptInstance(jsonOut);
            // console.log("typescript  type: " + typescript["$typename"]);

            const inModel = typescript as DemoModel;
            // console.log("inModel type: " + inModel.piLanguageConcept() + "  and name " + inModel.name + " id "+ inModel.$id);
            expect(typescript instanceof DemoModel).toBeTruthy();
            expect(typescript instanceof DemoFunction).toBeFalsy();
            expect(inModel.name).toBe("DemoModel_1");

            expect(inModel.entities.length).toBe(0);
            // const e1: DemoEntity = inModel.entities[0];
            // // expect(e1.owner).toBe(inModel);
            // expect(e1.name).not.toBeNull();
            // expect(e1.name).toBe("Person");
            // // expect(e1.functions.length).toBe(1);
            expect(inModel.functions.length).toBe(1);
            // expect(e1.piLanguageConcept()).toBe("DemoEntity");
        }
    });
});

