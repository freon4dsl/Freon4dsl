import { PiElementReference } from "@projectit/core";
import { DSmodel, DSref } from "../language/gen";
import { SimpleModelCreator } from "./SimpleModelCreator";
import { ScoperTestEnvironment } from "../config/gen/ScoperTestEnvironment";
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
    const environment = ScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const creator = new ExtendedModelCreator();
    const scoper = environment.scoper;
    const unparser = environment.writer;

    beforeEach(done => {
        ScoperTestEnvironment.getInstance();
        done();
    });

    test("validator messages in model with 1 unit of depth 3", () => {
        const model: DSmodel = creator.createModel(1, 3 );
        // run the scoper to test all names in the model
        const visibleNames = scoper.getVisibleNames( model.getUnits()[0] );

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

        // create extra references
        const ref1 = PiElementReference.create<DSref>(["unit1_OF_model", "private9_OF_unit1_OF_model"], "DSprivate");
        const ref2 = PiElementReference.create<DSref>(["unit1_OF_model", "public2_OF_unit1_OF_model"], "DSpublic");
        const ref3 = PiElementReference.create<DSref>([
            "unit1_OF_model",
            "public2_OF_unit1_OF_model",
            "private6_OF_public2_OF_unit1_OF_model" ], "DSpublic");
        const ref4 = PiElementReference.create<DSref>([
            "unit1_OF_model",
            "public2_OF_unit1_OF_model",
            "private6_OF_public2_OF_unit1_OF_model",
            "public7_OF_private6_OF_public2_OF_unit1_OF_model" ], "DSpublic");

        // add them to the other unit
        let otherUnit = model.findUnit("unit16_OF_model");
        console.log("otherUnit: " + otherUnit.$$propertyIndex)
        otherUnit.dsRefs.push(ref1);
        otherUnit.dsRefs.push(ref2);
        otherUnit.dsRefs.push(ref3);
        otherUnit.dsRefs.push(ref4);

        // try to resolve them
        expect(ref1.referred).toBeNull();
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        expect(ref3.referred).toBeNull();
        expect(ref4.referred).toBeNull();

        // now add them to the same unit
        let sameUnit = model.findUnit("unit1_OF_model");
        sameUnit.dsRefs.push(ref1);
        sameUnit.dsRefs.push(ref2);
        sameUnit.dsRefs.push(ref3);
        sameUnit.dsRefs.push(ref4);
        // the ref objects should be removed from their previous owner
        expect(otherUnit.dsRefs.length).toBe(0);
        // try to resolve them
        expect(ref1.referred?.name).toBe("private9_OF_unit1_OF_model");
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        // Next two are incorrect pathnames because second part is not a namespace
        expect(ref3.referred).toBeNull();
        expect(ref4.referred).toBeNull();
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
        expect (errors.length).toBe(858);
    });
});
