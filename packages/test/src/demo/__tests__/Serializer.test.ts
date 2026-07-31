import { LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json";
import { DemoEnvironment } from "../freon/config/DemoEnvironment.js";
import { DemoEntity, DemoFunction, DemoModel } from "../freon/language/index.js";
import { FREON, FreLionWebSerializer, FreModelSerializer, CoreConfig, FreLionWebDeserializer } from "@freon4dsl/core"
import { JsonModelCreator } from "./JsonModelCreator.js";
import { describe, it, test, expect, beforeEach } from "vitest";

const serializers = ["freon", "lionweb"];

// Run all, tests for both the Freon and LionWeb serializer
serializers.forEach(serializer => {

    describe("Checking Serializer on Demo", () => {
        CoreConfig.initialize(DemoEnvironment.getInstance(), null)
        let initialModel: DemoModel = new JsonModelCreator().model;

        // beforeEach(done => {
        //     done();
        // });

        test("model-to-json, followed by json-to-model should result in same model for " + serializer, () => {
            expect(initialModel.name).not.toBeNull();
            const serial = (serializer === "freon" ? new FreModelSerializer() : new FreLionWebSerializer());
            const deserial = serializer === "freon" ? new FreModelSerializer() : new FreLionWebDeserializer()
            const jsonOut = serial.serializeFreNode(initialModel);
            const chunk: LionWebJsonChunk = {
                languages: [],
                serializationFormatVersion: "2023.1",
                nodes: jsonOut as LionWebJsonNode[]
            }
            // console.log(JSON.stringify(jsonOut));

            FREON.astChanger.change(() => {
                const typescript = serializer === "freon" ? deserial.deserializeFreNode(jsonOut) : deserial.deserializeFreNode(chunk)
                // console.log("typescript  type: " + typescript["$typename"]);

                const inModel = typescript as DemoModel;
                // console.log("inModel type: " + inModel.freLanguageConcept() + "  and name " + inModel.name + " id "+ inModel.$id);
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
                expect(e1.freLanguageConcept()).toBe("DemoEntity");
            });
        });

        test("storing public only, with only 'name', 'function', and 'main' properties in DemoModel declared public  for " + serializer, () => {
            expect(initialModel.name).not.toBeNull();
            if (serializer === "lionweb") {
                // We don't store public json anymore in the LionWeb serializer, so no need to test
                return
            }

            let jsonOut: any = undefined
            if (serializer === "freon") {
                jsonOut = new FreModelSerializer().serializeFreNodePublicOnly(initialModel, true)
            } else {
                jsonOut = new FreLionWebSerializer().serializeFreNode(initialModel)
            }
            // console.log(JSON.stringify(jsonOut));

            if (!!jsonOut) {
                FREON.astChanger.change(() => {
                    const deserial = serializer === "freon" ? new FreModelSerializer() : new FreLionWebDeserializer()
                    const typescript = deserial.deserializeFreNode(jsonOut)
                    // console.log("typescript  type: " + typescript["$typename"]);

                    const inModel = typescript as DemoModel;
                    // console.log("inModel type: " + inModel.freLanguageConcept() + "  and name " + inModel.name + " id "+ inModel.$id);
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
                    // expect(e1.freLanguageConcept()).toBe("DemoEntity");
                });
            }
        });
    });
});
