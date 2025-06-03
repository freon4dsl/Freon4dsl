import { AST, FreNamedNode, FreNamespace, FreNodeReference } from '@freon4dsl/core';
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
    // const unparser = environment.writer;

    beforeEach(() => {
        DSmodelEnvironment.getInstance();
    });

    test("all names in model ", () => {
        // only model itself is a namespace, so every name should be visible
        const model: DSmodel = creator.createModel(2, 2);
        const allNames = getVisibleNames(scoper.getVisibleNodes(model));
        console.log(allNames);

        // There is only one namespace, so all names should be visible
        for (const x of creator.allNames) {
            expect(allNames).toContain(x);
        }
        // allNames are:
        // 'unit1_OF_model',
        //   'unit16_OF_model',
        //   'public2_OF_unit1_OF_model',
        //   'private9_OF_unit1_OF_model',
        //   'public3_OF_public2_OF_unit1_OF_model',
        //   'private6_OF_public2_OF_unit1_OF_model',
        //   'public4_OF_public3_OF_public2_OF_unit1_OF_model',
        //   'private5_OF_public3_OF_public2_OF_unit1_OF_model',
        //   'public7_OF_private6_OF_public2_OF_unit1_OF_model',
        //   'private8_OF_private6_OF_public2_OF_unit1_OF_model',
        //   'public10_OF_private9_OF_unit1_OF_model',
        //   'private13_OF_private9_OF_unit1_OF_model',
        //   'public11_OF_public10_OF_private9_OF_unit1_OF_model',
        //   'private12_OF_public10_OF_private9_OF_unit1_OF_model',
        //   'public14_OF_private13_OF_private9_OF_unit1_OF_model',
        //   'private15_OF_private13_OF_private9_OF_unit1_OF_model',
        //   'public17_OF_unit16_OF_model',
        //   'private24_OF_unit16_OF_model',
        //   'public18_OF_public17_OF_unit16_OF_model',
        //   'private21_OF_public17_OF_unit16_OF_model',
        //   'public19_OF_public18_OF_public17_OF_unit16_OF_model',
        //   'private20_OF_public18_OF_public17_OF_unit16_OF_model',
        //   'public22_OF_private21_OF_public17_OF_unit16_OF_model',
        //   'private23_OF_private21_OF_public17_OF_unit16_OF_model',
        //   'public25_OF_private24_OF_unit16_OF_model',
        //   'private28_OF_private24_OF_unit16_OF_model',
        //   'public26_OF_public25_OF_private24_OF_unit16_OF_model',
        //   'private27_OF_public25_OF_private24_OF_unit16_OF_model',
        //   'public29_OF_private28_OF_private24_OF_unit16_OF_model',
        //   'private30_OF_private28_OF_private24_OF_unit16_OF_model'
    })

    test("references in model with 2 units of depth 2, no interfaces", () => {
        // only model itself is a namespace, so every name should be visible
        const model: DSmodel = creator.createModel(2, 2);
        let ref1: FreNodeReference<DSref>;
        let ref2: FreNodeReference<DSref>;
        let ref3: FreNodeReference<DSref>;
        let ref4: FreNodeReference<DSref>;
        let otherUnit: DSunit;

        AST.change( () => {
            // create extra references
            ref1 = FreNodeReference.create<DSref>(["private9_OF_unit1_OF_model"], "DSprivate");
            ref2 = FreNodeReference.create<DSref>(["public2_OF_unit1_OF_model"], "DSpublic");
            ref3 = FreNodeReference.create<DSref>(["private6_OF_public2_OF_unit1_OF_model"], "DSprivate");
            ref4 = FreNodeReference.create<DSref>(["public7_OF_private6_OF_public2_OF_unit1_OF_model"], "DSpublic");

            // add them to the other unit
            otherUnit = model.findUnit("unit16_OF_model") as DSunit;
            // console.log("otherUnit: " + otherUnit.$$propertyIndex);
            otherUnit.dsRefs.push(ref1);
            otherUnit.dsRefs.push(ref2);
            otherUnit.dsRefs.push(ref3);
            otherUnit.dsRefs.push(ref4);
        });

        // try to resolve them
        expect(ref1.referred?.name).toBe("private9_OF_unit1_OF_model");
        expect(ref2.referred?.name).toBe("public2_OF_unit1_OF_model");
        expect(ref3.referred?.name).toBe("private6_OF_public2_OF_unit1_OF_model");
        expect(ref4.referred?.name).toBe("public7_OF_private6_OF_public2_OF_unit1_OF_model");

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
        expect(ref3.referred?.name).toBe("private6_OF_public2_OF_unit1_OF_model");
        expect(ref4.referred?.name).toBe("public7_OF_private6_OF_public2_OF_unit1_OF_model");
    });
});
