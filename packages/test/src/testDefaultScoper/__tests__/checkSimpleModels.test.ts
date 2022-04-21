import { printModel1 } from "../../demo/utils/index";
import { DSmodel } from "../language/gen";
import { SimpleModelCreator } from "./SimpleModelCreator";
import { ScoperTestEnvironment } from "../environment/gen/ScoperTestEnvironment";

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
    const creator = new SimpleModelCreator();
    const environment = ScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const scoper = environment.scoper;
    const unparser = environment.writer;

    test("names in model with 1 unit of depth 2", () => {
        const model: DSmodel = creator.createModel(1, 2 );
        // run the scoper to test all names in the model
        const visibleNames = scoper.getVisibleNames( model.units[0] );
        printDifference(creator, visibleNames);
        // print("names in model of depth 2: ", visibleNames);
        for (const x of creator.allNames) {
            if (!visibleNames.includes(x)) {
                // console.log(`do not include ${x}`)
            }
            expect(visibleNames).toContain(x);
        }
        // // run unparser to inspect model
        // const unparsed: string = unparser.writeToString(model, 0, false);
        // const path: string = "./unparsedGeneratedModel.txt";
        // if (!fs.existsSync(path)) {
        //     fs.writeFileSync(path, unparsed);
        // } else {
        //     console.log(this, "test-unparser: user file " + path + " already exists, skipping it.");
        // }
        // // run the validator to see if the references are ok
        // const validator = environment.validator;
        // const errors = validator.validate(model);
        // const errorMessages: string[] = [];
        // errors.forEach(mess => {
        //     errorMessages.push(mess.message + " in " + mess.locationdescription);
        // });
        // // print("found errors", errorMessages);
        // expect (errors.length).toBe(0);
    });

    test("names in model with 3 units of depth 2, without unit interfaces", () => {
        const model: DSmodel = creator.createModel(3, 2);
        const visibleNames = scoper.getVisibleNames(model.units[0]);
         // the only names that may be visible are the names of all model units, plus all names within the own unit
        // the latter all contain the name of unit
        let namesToTest = creator.allNames.filter(name => name.includes(model.units[0].name) || name === model.units[1].name || name === model.units[2].name);
        for (const x of namesToTest) {
            expect(visibleNames).toContain(x);
        }
        for (const x of visibleNames) {
            expect(namesToTest).toContain(x);
        }

        const visibleNames2 = scoper.getVisibleNames(model.units[1]);
        // the only names that may be visible are the names of all model units, plus all names within the own unit
        // the latter all contain the name of unit
        namesToTest = creator.allNames.filter(name => name.includes(model.units[1].name) || name === model.units[0].name || name === model.units[2].name);
        for (const x of namesToTest) {
            expect(visibleNames2).toContain(x);
        }
        for (const x of visibleNames2) {
            expect(namesToTest).toContain(x);
        }
        const visibleNames3 = scoper.getVisibleNames(model.units[2]);
        // the only names that may be visible are the names of all model units, plus all names within the own unit
        // the latter all contain the name of unit
        namesToTest = creator.allNames.filter(name => name.includes(model.units[2].name) || name === model.units[0].name || name === model.units[1].name);
        for (const x of namesToTest) {
            expect(visibleNames3).toContain(x);
        }
        for (const x of visibleNames3) {
            expect(namesToTest).toContain(x);
        }
    });

    test("names in model with 3 units of depth 2, with unit interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(3, 2, 2);
        let visibleNames = scoper.getVisibleNames(model.units[0]);
        // the only names that may be visible in a non-primary unit are the names of all model units, plus all public names within the own unit
        // the latter all contain the name of unit, but do not conatin the word 'private'
        let namesToTest = creator.allNames.filter(name => name.includes(model.units[0].name) || name === model.units[1].name || name === model.units[2].name)
            .filter(n => !n.includes("private"));
        for (const x of namesToTest) {
            expect(visibleNames).toContain(x);
        }
        for (const x of visibleNames) {
            expect(namesToTest).toContain(x);
        }
        visibleNames = scoper.getVisibleNames(model.units[1]);
        // the only names that may be visible in a non-primary unit are the names of all model units, plus all public names within the own unit
        // the latter all contain the name of unit, but do not conatin the word 'private'
        namesToTest = creator.allNames.filter(name => name.includes(model.units[1].name) || name === model.units[0].name || name === model.units[2].name)
            .filter(n => !n.includes("private"));
        for (const x of namesToTest) {
            expect(visibleNames).toContain(x);
        }
        for (const x of visibleNames) {
            expect(namesToTest).toContain(x);
        }        visibleNames = scoper.getVisibleNames(model.units[2]);
        // the only names that may be visible in a primary unit are the names of all model units, plus all names within the own unit
        // the latter all contain the name of unit
        namesToTest = creator.allNames.filter(name => name.includes(model.units[2].name) || name === model.units[0].name || name === model.units[1].name);
        for (const x of namesToTest) {
            expect(visibleNames).toContain(x);
        }
        for (const x of visibleNames) {
            expect(namesToTest).toContain(x);
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
        // print("found errors", errorMessages);
        expect(errors.length).toBe(8);
        expect(errorMessages.includes("Cannot find reference 'private30_OF_private28_OF_private24_OF_unit16_OF_model' in dsRefs of unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'private27_OF_public25_OF_private24_OF_unit16_OF_model' in dsRefs of unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'public29_OF_private28_OF_private24_OF_unit16_OF_model' in conceptRefs of public2_OF_unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'private28_OF_private24_OF_unit16_OF_model' in conceptRefs of public2_OF_unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'public26_OF_public25_OF_private24_OF_unit16_OF_model' in conceptRefs of public2_OF_unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'public25_OF_private24_OF_unit16_OF_model' in conceptRefs of public2_OF_unit1_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Reference 'unit16_OF_model' should have type 'DSref', but found type(s) [DSunit] in conceptRefs of public17_OF_unit16_OF_model")).toBeTruthy();
        expect(errorMessages.includes("Cannot find reference 'private15_OF_private13_OF_private9_OF_unit1_OF_model' in conceptRefs of public17_OF_unit16_OF_model")).toBeTruthy();
    });
});
