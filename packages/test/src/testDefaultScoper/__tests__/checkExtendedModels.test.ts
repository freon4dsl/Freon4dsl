import { AST, FreNamedNode, FreNodeReference } from '@freon4dsl/core';
import { DSmodel, DSref, DSunit } from "../language/gen/index.js";
import { SimpleModelCreator } from "./SimpleModelCreator.js";
import { DSmodelEnvironment } from "../config/gen/DSmodelEnvironment.js";
import { ExtendedModelCreator } from "./ExtendedModelCreator.js";
import { describe, test, expect, beforeEach } from "vitest";
import { getVisibleNames } from '../../utils/HelperFunctions';

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
    const environment = DSmodelEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const creator = new ExtendedModelCreator();
    const scoper = environment.scoper;
    const unparser = environment.writer;

    beforeEach(() => {
        DSmodelEnvironment.getInstance();
    });

    test("validator messages in model with 1 unit of depth 3", () => {
        const model: DSmodel = creator.createModel(1, 3);
        // run the scoper to test all names in the model
        const visibleNames = getVisibleNames(scoper, model.getUnits()[0]);

        // There is only one modelunit, so all names should be visible
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
        // TODO uncomment this test
        // run the validator to see if the references are ok
        // const validator = environment.validator;
        // const errors = validator.validate(model);
        // const errorMessages: string[] = [];
        // errors.forEach(mess => {
        //     errorMessages.push(mess.message + " in " + mess.locationdescription);
        // });
        // print("found errors", errorMessages);
        // TODO type-check in validator does not take interfaces into account
        // expect (errors.length).toBe(0);
        // console.log("ERROR FOUND")
        // errors.forEach(e => {
        //    console.log("Error: " + e.locationdescription + ": " + e.message)
        // });
        // expect (errors.length).toBe(168);
    });

    test("references in model with 2 units of depth 2, no interfaces", () => {
        const model: DSmodel = creator.createModel(2, 2);
        let ref1: FreNodeReference<DSref>;
        let ref2: FreNodeReference<DSref>;
        let ref3: FreNodeReference<DSref>;
        let ref4: FreNodeReference<DSref>;
        let otherUnit: DSunit;

        AST.change( () => {
            // create extra references
            ref1 = FreNodeReference.create<DSref>(["unit1_OF_model", "private9_OF_unit1_OF_model"], "DSprivate");
            ref2 = FreNodeReference.create<DSref>(["unit1_OF_model", "public2_OF_unit1_OF_model"], "DSpublic");
            ref3 = FreNodeReference.create<DSref>(
              ["unit1_OF_model", "public2_OF_unit1_OF_model", "private6_OF_public2_OF_unit1_OF_model"],
              "DSpublic",
            );
            ref4 = FreNodeReference.create<DSref>(
              [
                  "unit1_OF_model",
                  "public2_OF_unit1_OF_model",
                  "private6_OF_public2_OF_unit1_OF_model",
                  "public7_OF_private6_OF_public2_OF_unit1_OF_model",
              ],
              "DSpublic",
            );

            // add them to the other unit
            otherUnit = model.findUnit("unit16_OF_model") as DSunit;
            // console.log("otherUnit: " + otherUnit.$$propertyIndex);
            otherUnit.dsRefs.push(ref1);
            otherUnit.dsRefs.push(ref2);
            otherUnit.dsRefs.push(ref3);
            otherUnit.dsRefs.push(ref4);
        });

        // try to resolve them
        expect(ref1.referred).toBeUndefined();
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        expect(ref3.referred).toBeUndefined();
        expect(ref4.referred).toBeUndefined();

        // now add them to the same unit
        AST.change( () => {
            let sameUnit = model.findUnit("unit1_OF_model") as DSunit;
            sameUnit.dsRefs.push(ref1);
            sameUnit.dsRefs.push(ref2);
            sameUnit.dsRefs.push(ref3);
            sameUnit.dsRefs.push(ref4);
        });
        // the ref objects should be removed from their previous owner
        expect(otherUnit.dsRefs.length).toBe(0);
        // try to resolve them
        expect(ref1.referred?.name).toBe("private9_OF_unit1_OF_model");
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        // Next two are incorrect pathnames because second part is not a namespace
        expect(ref3.referred).toBeUndefined();
        expect(ref4.referred).toBeUndefined();
    });

    test.skip("validator messages in model with 2 units of depth 3", () => {
        const model: DSmodel = creator.createModel(2, 3);
        const validator = environment.validator;
        const errors = validator.validate(model);
        // const errorMessages: string[] = [];
        // errors.forEach(mess => {
        //     errorMessages.push(mess.message + " in " + mess.locationdescription);
        // });
        // print("found errors", errorMessages);
        expect(errors.length).toBe(858);
    });
});
