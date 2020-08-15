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

function printDifference(creator: ModelCreator, visibleNames: string[]) {
    let diff: string[] = [];
    for (let yy of creator.allNames) {
        if (!visibleNames.includes(yy)) diff.push(yy);
    }
    if (diff.length > 0) print("Difference", diff);
}

describe("Testing Default Scoper", () => {
    const scoper = new DefaultScoperTestScoper();
    const unparser = new DefaultScoperTestUnparser();
    const creator = new ModelCreator();
    const environment = DefaultScoperTestEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer

    test("names in model with 1 unit of depth 2", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(1,2);
        let visibleNames = scoper.getVisibleNames(model);
        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in model with 3 units of depth 2, without unit interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(3,2);
        let visibleNames = scoper.getVisibleNames(model);
        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in all modelunits of model with 3 units of depth 2, without unit interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(3,2);
        for( let myUnit of model.units) {
            let visibleNames = scoper.getVisibleNames(myUnit);
            for (let x of creator.allNames) {
                expect(visibleNames).toContain(x);
            }
        }
    });

    test("names in model with 1 unit of depth 2, with interfaces", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModelWithInterfaces(1,2, 0);
        let visibleNames = scoper.getVisibleNames(model);
        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test("names in model with 4 units of depth 3, with interfaces", () => {
        const creator = new ModelCreator();
        const primaryIndex = 0;
        let model: DSmodel = creator.createModelWithInterfaces(4,3, primaryIndex);
        let visibleNames = scoper.getVisibleNames(model);
        // all names from primary unit, and only public names from other units should be visible
        let primaryUnit = model.units[primaryIndex];
        for (let anyName of creator.allNames) {
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

});

