import { DSmodel } from "../language/gen";
import { ModelCreator } from "./ModelCreator";
import { DefinedScoperTestScoper } from "../scoper/gen";
import { DefinedScoperTestUnparser } from "../unparser/gen/DefinedScoperTestUnparser";

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

describe("Testing Defined Scoper, where unit is namespace", () => {
    const scoper = new DefinedScoperTestScoper();
    const unparser = new DefinedScoperTestUnparser();
    const creator = new ModelCreator();

    test("model with 1 unit of depth 2: names visible in model are all unit names", () => {
        let model: DSmodel = creator.createModel(1,2);
        let visibleNames = scoper.getVisibleNames(model);
        expect(visibleNames.length).toBe(1);
        expect(visibleNames).toContain(model.units[0].name);
    });

    test("model with 10 units of depth 2: names visible in model are all unit names", () => {
        let model: DSmodel = creator.createModel(10,2);
        let visibleNames = scoper.getVisibleNames(model);
        expect(visibleNames.length).toBe(10);
        for (let xx of model.units) {
            expect(visibleNames).toContain(xx.name);
        }
    });

    test("unit in model with 5 units of depth 2: names should only be visible within the same unit", () => {
        let model: DSmodel = creator.createModel(5,2);
        let visibleUnitNames = scoper.getVisibleNames(model);
        for (let myUnit of model.units) {
            let visibleNames = scoper.getVisibleNames(myUnit);
            expect(visibleNames).toContain(myUnit.name);
            for (let anyName of creator.allNames) {
                if (anyName.includes(myUnit.name)) {
                    expect(visibleNames).toContain(anyName);
                } else {
                    if (visibleUnitNames.includes(anyName)) { // partName is the name of another unit
                        expect(visibleNames).toContain(anyName);
                    } else {
                        expect(visibleNames).not.toContain(anyName);
                    }
                }
            }
        }
    });

    test("dsPart in model with 5 units of depth 3: visible names of a part of a unit should be the same list as the visible names of the unit", () => {
        let model: DSmodel = creator.createModel(5,3);
        let visibleUnitNames = scoper.getVisibleNames(model);
        for (let myUnit of model.units) {
            let namesInUnit = scoper.getVisibleNames(myUnit);
            for (let dsPart of myUnit.dsParts) {
                let namesInPart = scoper.getVisibleNames(dsPart);
                for (let myName of namesInPart) {
                    expect(namesInUnit.includes(myName)).toBeTruthy();
                }
                for (let myName of namesInUnit) {
                    expect(namesInPart.includes(myName)).toBeTruthy();
                }
            }
        }
    });

    test("dsPrivate in model with 5 units of depth 3", () => {
        let model: DSmodel = creator.createModel(5,3);
        let visibleUnitNames = scoper.getVisibleNames(model);
        for (let myUnit of model.units) {
            let namesInUnit = scoper.getVisibleNames(myUnit);
            for (let dsPrivate of myUnit.dsPrivates) {
                // visible names of a part of a unit should be the same list as the visible names of the unit
                let namesInPart = scoper.getVisibleNames(dsPrivate);
                for (let myName of namesInPart) {
                    expect(namesInUnit.includes(myName)).toBeTruthy();
                }
                for (let myName of namesInUnit) {
                    expect(namesInPart.includes(myName)).toBeTruthy();
                }
            }
        }
    });
});

