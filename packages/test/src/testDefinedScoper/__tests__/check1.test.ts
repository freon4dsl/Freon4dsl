import { DSmodel } from "../language/gen";
import { SimpleModelCreator } from "./ModelCreator";
import { DSmodelEnvironment } from "../config/gen/DSmodelEnvironment";
import { describe, test, expect } from "vitest"

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

describe("Testing Defined Scoper, where unit is namespace", () => {
    const creator = new SimpleModelCreator();
    const environment = DSmodelEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const scoper = environment.scoper;

    test("model with 1 unit of depth 2: names visible in model are all unit names", () => {
        const model: DSmodel = creator.createModel(1, 2);
        expect(model.units[0]).not.toBeNull();
        const visibleNames = scoper.getVisibleNames(model);
        expect(visibleNames.length).toBe(1);
        expect(visibleNames).toContain(model.units[0].name);
    });

    test("model with 10 units of depth 2: names visible in model are all unit names", () => {
        const model: DSmodel = creator.createModel(10, 2);
        const visibleNames = scoper.getVisibleNames(model);
        expect(visibleNames.length).toBe(10);
        for (const xx of model.units) {
            expect(visibleNames).toContain(xx.name);
        }
    });

    test("unit in model with 5 units of depth 2: names should only be visible within the same unit", () => {
        const model: DSmodel = creator.createModel(5, 2);
        const visibleUnitNames = scoper.getVisibleNames(model);
        for (const myUnit of model.units) {
            const visibleNames = scoper.getVisibleNames(myUnit);
            expect(visibleNames).toContain(myUnit.name);
            for (const anyName of creator.allNames) {
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

    test("visible names of a part of a unit should be the same list as the visible names of the unit", () => {
        const model: DSmodel = creator.createModel(5, 3);
        for (const myUnit of model.units) {
            const namesInUnit = scoper.getVisibleNames(myUnit);
            for (const dsPublic of myUnit.dsPublics) {
                const namesInPart = scoper.getVisibleNames(dsPublic);
                for (const myName of namesInPart) {
                    expect(namesInUnit.includes(myName)).toBeTruthy();
                }
                for (const myName of namesInUnit) {
                    expect(namesInPart.includes(myName)).toBeTruthy();
                }
            }
        }
    });

    test("dsPrivate in model with 5 units of depth 3", () => {
        const model: DSmodel = creator.createModel(5, 3);
        for (const myUnit of model.units) {
            const namesInUnit = scoper.getVisibleNames(myUnit);
            for (const dsPrivate of myUnit.dsPrivates) {
                // visible names of a part of a unit should be the same list as the visible names of the unit
                const namesInPart = scoper.getVisibleNames(dsPrivate);
                for (const myName of namesInPart) {
                    expect(namesInUnit.includes(myName)).toBeTruthy();
                }
                for (const myName of namesInUnit) {
                    expect(namesInPart.includes(myName)).toBeTruthy();
                }
            }
        }
    });

    test.skip("names in model with 1 unit of depth 2, with interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(1, 2, 0);
        const visibleNames = scoper.getVisibleNames(model);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test.skip("names in model with 4 units of depth 3, with interfaces", () => {
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
});
