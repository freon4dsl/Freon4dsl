import { DSmodel } from "../language/gen";
import { ModelCreator } from "./ModelCreator";
import { ScoperTestEnvironment } from "../environment/gen/ScoperTestEnvironment";
import * as fs from "fs";

function print(prefix: string, visibleNames: string[]) {
    let printable: string = "";
    for (const name of visibleNames) {
        printable += "\n\t" + name + ",";
    }
    console.log(prefix + ": " + printable);
}

function printDifference(creator: ModelCreator, visibleNames: string[]) {
    const diff: string[] = [];
    for (const yy of creator.allNames) {
        if (!visibleNames.includes(yy)) {
            diff.push(yy);
        }
    }
    if (diff.length > 0) {
        print("Difference", diff);
    }
}

describe("Testing Default Scoper", () => {
    const creator = new ModelCreator();
    const environment = ScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const scoper = environment.scoper;
    const unparser = environment.writer;

    test("names in model with 1 unit of depth 2", () => {
        const model: DSmodel = creator.createModel(1, 2 );
        // run the scoper to test all names in the model
        const visibleNames = scoper.getVisibleNames( model );
        // print("names in model of depth 2: ", visibleNames);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
        // run unparser to inspect model
        const unparsed: string = unparser.writeToString(model, 0, false);
        const path: string = "./unparsedGeneratedModel.txt";
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, unparsed);
        } else {
            console.log("check1.test: test-unparser: user file " + path + " already exists, skipping it.");
        }
        // run the validator to see if the references are ok
        const validator = environment.validator;
        const errors = validator.validate(model);
        const errorMessages: string[] = [];
        errors.forEach(mess => {
            errorMessages.push(mess.message + " in " + mess.locationdescription);
        });
        // print("found errors", errorMessages);
        expect (errors.length).toBe(0);
    });

    test("names in model with 3 units of depth 2, without unit interfaces", () => {
        const model: DSmodel = creator.createModel(3, 2);
        const visibleNames = scoper.getVisibleNames(model);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in all modelunits of model with 3 units of depth 2, without unit interfaces", () => {
        const model: DSmodel = creator.createModel(3, 2);
        for ( const myUnit of model.units) {
            const visibleNames = scoper.getVisibleNames(myUnit);
            for (const x of creator.allNames) {
                expect(visibleNames).toContain(x);
            }
        }
    });

    test("names in model with 1 unit of depth 2, with interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(1, 2, 0);
        const visibleNames = scoper.getVisibleNames(model);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in model with 4 units of depth 3, with interfaces", () => {
        const primaryIndex = 0;
        const model: DSmodel = creator.createModelWithInterfaces(4, 3, primaryIndex);
        const visibleNames = scoper.getVisibleNames(model);
        // all names from primary unit, and only public names from other units should be visible
        const primaryUnit = model.units[primaryIndex];
        for (const anyName of creator.allNames) {
            if (anyName.includes(primaryUnit.name)) {
                expect(visibleNames).toContain(anyName);
            } else {
                if (anyName.includes("private")) {
                    expect(visibleNames).not.toContain(anyName);
                } else {
                    expect(visibleNames).toContain(anyName);
                }
            }
        }
    });

    test("references in model with 2 units of depth 2, with interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(2, 2, 1);
        const validator = environment.validator;
        const errors = validator.validate(model);
        const errorMessages: string[] = [];
        errors.forEach(mess => {
            errorMessages.push(mess.message + " in " + mess.locationdescription);
        });
        print("found errors", errorMessages);
        expect (errors.length).toBe(2);
    });
});
