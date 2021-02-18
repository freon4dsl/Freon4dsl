import { DSmodel } from "../language/gen";
import { SimpleModelCreator } from "./SimpleModelCreator";
import { ScoperTestEnvironment } from "../environment/gen/ScoperTestEnvironment";
import * as fs from "fs";
import { ExtendedModelCreator } from "./ExtendedModelCreator";

function print(prefix: string, visibleNames: string[]) {
    let printable: string = "";
    for (const name of visibleNames) {
        printable += "\n\t" + name + ",";
    }
    console.log(prefix + ": " + printable);
}

function printDifference(creator: SimpleModelCreator, visibleNames: string[]) {
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
    const creator = new ExtendedModelCreator();
    const environment = ScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const scoper = environment.scoper;
    const unparser = environment.writer;

    test("names in model with 1 unit of depth 3", () => {
        const model: DSmodel = creator.createModel(1, 1 );
        // run the scoper to test all names in the model
        const visibleNames = scoper.getVisibleNames( model );
        // print("names in model of depth 2: ", visibleNames);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
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

    test("references in model with 2 units of depth 3, with interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(2, 3, 1);
        const validator = environment.validator;
        const errors = validator.validate(model);
        const errorMessages: string[] = [];
        errors.forEach(mess => {
            errorMessages.push(mess.message + " in " + mess.locationdescription);
        });
        // print("found errors", errorMessages);
        expect (errors.length).toBe(0);
    });
});
