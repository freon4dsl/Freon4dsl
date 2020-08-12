import { DSmodel } from "../language/gen";
import { ModelCreator } from "./ModelCreator";
import { DefaultScoperTestScoper } from "../scoper/gen";
import { DefaultScoperTestUnparser } from "../unparser/gen/DefaultScoperTestUnparser";
import { DefaultScoperTestEnvironment } from "../environment/gen/DefaultScoperTestEnvironment";

function print(prefix: string, visibleNames: string[]) {
    let printable: string = "";
    for (let name of visibleNames) {
        printable += "\n\t" + name + ",";
    }
    console.log(prefix + ": " + printable);
}

describe("Testing Default Scoper", () => {
    const scoper = new DefaultScoperTestScoper();
    const unparser = new DefaultScoperTestUnparser();
    const environment = DefaultScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer

    test("names in model with 1 unit of depth 2", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(1,2);
        let visibleNames = scoper.getVisibleNames(model);
        // print("FOUND", visibleNames);
        // print("AllNames", creator.allNames);

        // let diff: string[] = [];
        // for (let yy of creator.allNames) {
        //     if (!visibleNames.includes(yy)) diff.push(yy);
        // }
        // if (diff.length > 0) print("Difference", diff);

        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in model with 3 units of depth 2, without unit interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(3,2);
        let visibleNames = scoper.getVisibleNames(model);
        // print("FOUND", visibleNames);
        // print("AllNames", creator.allNames);

        // let diff: string[] = [];
        // for (let yy of creator.allNames) {
        //     if (!visibleNames.includes(yy)) diff.push(yy);
        // }
        // if (diff.length > 0) print("Difference", diff);

        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in all modelunits of model with 3 units of depth 2, without unit interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(3,2);
        for( let myUnit of model.units) {
            let visibleNames = scoper.getVisibleNames(myUnit);
            // print("FOUND", visibleNames);
            // print("AllNames", creator.allNames);

            // let diff: string[] = [];
            // for (let yy of creator.allNames) {
            //     if (!visibleNames.includes(yy)) diff.push(yy);
            // }
            // if (diff.length > 0) print("Difference", diff);

            for (let x of creator.allNames) {
                expect(visibleNames).toContain(x);
            }
        }
    });

    test("names in model with 1 unit of depth 2, with interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModelWithInterfaces(1,2, 0);
        let visibleNames = scoper.getVisibleNames(model);
        // print("FOUND", visibleNames);
        // print("AllNames", creator.allNames);

        // let diff: string[] = [];
        // for (let yy of creator.allNames) {
        //     if (!visibleNames.includes(yy)) diff.push(yy);
        // }
        // if (diff.length > 0) print("Difference", diff);

        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test.skip("names in unit of model with 3 units of depth 2, with unit interfaces", () => {
        const creator = new ModelCreator();
        const indexOfPrimary = 0;
        let model: DSmodel = creator.createModelWithInterfaces(2,1, indexOfPrimary);
        let visibleNames = scoper.getVisibleNames(model);
        // for (let x of creator.allNames) {
        //     // private parts may only be visible in their own unit
        //     if (x.includes("private")) {
        //         if (x.includes(primaryUnitName)) {
        //             expect(visibleNames).toContain(x);
        //         } else {
        //             expect(visibleNames).not.toContain(x);
        //         }
        //     } else {
        //         expect(visibleNames).toContain(x);
        //     }
        // }



        // const primaryUnitName = model.units[indexOfPrimary].name;
        // console.log("primaryUnitName: " + primaryUnitName);
        // model.units.forEach((myUnit, index) => {
        //     let visibleNames = scoper.getVisibleNames(myUnit);
        //     // print("FOUND", visibleNames);
        //     // print("AllNames", creator.allNames);
        //
        //     console.log("working on unit: " + myUnit.name);
        //     let diff: string[] = [];
        //     for (let yy of creator.allNames) {
        //         if (!visibleNames.includes(yy)) diff.push(yy);
        //     }
        //     if (diff.length > 0) print("Not present in visibleNames", diff);
        //
        //     if (index != indexOfPrimary) {
        //         for (let x of creator.allNames) {
        //             // there should not be any private parts visible in a non-primary unit, because they are present in interface form
        //             if (x.includes("private")) {
        //                 expect(visibleNames).not.toContain(x);
        //             } else {
        //                 expect(visibleNames).toContain(x);
        //             }
        //         }
        //     }
        // });
    });

});

