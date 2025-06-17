import { AST } from "@freon4dsl/core";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { DemoEnvironment } from "../config/gen/DemoEnvironment.js";
import { Demo, DemoModel } from "../language/gen/index.js";
import { FileHandler } from "../../utils/FileHandler.js";
import { describe, test, expect, beforeEach } from "vitest";

describe("Testing Parser", () => {
    beforeEach(() => {
        DemoEnvironment.getInstance();
        // done();
    });

    test("complete example model unparsed and parsed again", () => {
        const originalModel = new DemoModelCreator().createCorrectModel();
        const unparser = DemoEnvironment.getInstance().writer;
        const parser = DemoEnvironment.getInstance().reader;
        const validator = DemoEnvironment.getInstance().validator;

        // first do a check on the input model
        expect(originalModel.models.length).toBeGreaterThan(0);
        originalModel.models.forEach((ent) => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });

        const errors = validator.validate(originalModel);
        // for (const e of errors) {
        //     console.log(e.message + " => " + e.locationdescription);
        // }
        // do not unparse if there are more errors than the four custom ones
        if (errors.length === 4) {
            // the custom validator adds 4 unnecessary errors
            const path: string = "./unparsedDemoModel1.txt";
            const fileHandler = new FileHandler();

            // unparse the first unit to a string and write it to File
            const unparsed = unparser.writeToString(originalModel.models[0])
            console.log(unparsed)
            fileHandler.stringToFile(path, unparsed);
            // read it back in, in a completely new model

            let readModel
            AST.change( () => {
                readModel = parser.readFromString(
                    fileHandler.stringFromFile(path),
                    "DemoModel",
                    new Demo(),
                ) as DemoModel;
            })
            // compare the read unit with the original
            // check the name
            expect(originalModel.models[0].name).toBe(readModel.name);
            // check the entities
            originalModel.models[0].entities.forEach((original) => {
                // check entity name
                const foundEntity = readModel.entities.find((readEnt) => readEnt.name === original.name);
                expect(foundEntity).not.toBeNull();
                // check entity attributes
                original.attributes.forEach((originalAttr) => {
                    const foundAttr = foundEntity.attributes.find((readAttr) => readAttr.name === originalAttr.name);
                    expect(foundAttr).not.toBeNull();
                });
            });
            // check the model wide functions
            originalModel.models[0].functions.forEach((originalFunction) => {
                const foundFunction = readModel.functions.find((readFunc) => readFunc.name === originalFunction.name);
                expect(foundFunction).not.toBeNull();
                originalFunction.parameters.forEach((origParam) => {
                    const foundParam = foundFunction.parameters.find((readAttr) => readAttr.name === origParam.name);
                    expect(foundParam).not.toBeNull();
                });
            });
            // TODO add more comparisons to the test???
        }
    });
});
