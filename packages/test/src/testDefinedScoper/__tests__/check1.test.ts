import { DSmodel } from "../freon/language/gen";
import { SimpleModelCreator } from "./ModelCreator";
import { DSmodelEnvironment } from "../freon/config/gen/DSmodelEnvironment";
import { describe, test, expect } from "vitest";
import { getVisibleNames } from '../../utils/HelperFunctions';
import { AST, FreNodeReference } from '@freon4dsl/core';
import { DSref, DSunit } from '../../testDefaultScoper/freon/language/gen';

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
        const visibleNames = getVisibleNames(scoper.getVisibleNodes(model));
        expect(visibleNames.length).toBe(1);
        expect(visibleNames).toContain(model.units[0].name);
    });

    test("model with 10 units of depth 2: names visible in model are all unit names", () => {
        const model: DSmodel = creator.createModel(10, 2);
        const visibleNames = getVisibleNames(scoper.getVisibleNodes(model));
        expect(visibleNames.length).toBe(10);
        for (const xx of model.units) {
            expect(visibleNames).toContain(xx.name);
        }
    });

    test("unit in model with 5 units of depth 2: names should only be visible within the same unit", () => {
        const model: DSmodel = creator.createModel(5, 2);
        const visibleUnitNames = getVisibleNames(scoper.getVisibleNodes(model));
        for (const myUnit of model.units) {
            const visibleNames = getVisibleNames(scoper.getVisibleNodes(myUnit));
            expect(visibleNames).toContain(myUnit.name);
            for (const anyName of creator.allNames) {
                if (anyName.includes(myUnit.name)) {
                    expect(visibleNames).toContain(anyName);
                } else {
                    if (visibleUnitNames.includes(anyName)) {
                        // partName is the name of another unit
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
            const namesInUnit = getVisibleNames(scoper.getVisibleNodes(myUnit));
            for (const dsPublic of myUnit.dsPublics) {
                const namesInPart = getVisibleNames(scoper.getVisibleNodes(dsPublic));
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
            const namesInUnit = getVisibleNames(scoper.getVisibleNodes(myUnit));
            for (const dsPrivate of myUnit.dsPrivates) {
                // visible names of a part of a unit should be the same list as the visible names of the unit
                const namesInPart = getVisibleNames(scoper.getVisibleNodes(dsPrivate));
                for (const myName of namesInPart) {
                    expect(namesInUnit.includes(myName)).toBeTruthy();
                }
                for (const myName of namesInUnit) {
                    expect(namesInPart.includes(myName)).toBeTruthy();
                }
            }
        }
    });

    test("names in unit of depth 2, with interfaces", () => {
        const model: DSmodel = creator.createModelWithInterfaces(1, 2, 0);
        const visibleNames = getVisibleNames(scoper.getVisibleNodes(model.getUnits()[0]));
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });

    test.skip("names in model with 4 units of depth 3, with interfaces", () => {
        const primaryIndex = 0;
        const model: DSmodel = creator.createModelWithInterfaces(4, 3, primaryIndex);
        const visibleNames = getVisibleNames(scoper.getVisibleNodes(model));
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
                  "public7_OF_private6_OF_public2_OF_unit1_OF_model",
              ],
              "DSpublic",
            );

            // add them to the other unit
            otherUnit = model.findUnit("unit16_OF_model") as DSunit;
            expect(otherUnit.dsRefs.length).toBe(2);
            // console.log("otherUnit: " + otherUnit.$$propertyIndex);
            otherUnit.dsRefs.push(ref1);
            otherUnit.dsRefs.push(ref2);
            otherUnit.dsRefs.push(ref3);
            otherUnit.dsRefs.push(ref4);
        });

        // try to resolve them
        // expect(ref1.referred).toBeUndefined();
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
        expect(otherUnit.dsRefs.length).toBe(2);
        // try to resolve them
        expect(ref1.referred?.name).toBe("private9_OF_unit1_OF_model");
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        // Next two are incorrect pathnames because second part is not a namespace
        expect(ref3.referred).toBeUndefined();
        expect(ref4.referred).toBeUndefined();
    });
});
