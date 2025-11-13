import { DSmodel } from '../freon/language/gen';
import { SimpleModelCreator } from "./SimpleModelCreator.js";
import { DSmodelEnvironment } from "../freon/config/gen/DSmodelEnvironment.js";
import { describe, test, expect } from "vitest";
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
    const creator = new SimpleModelCreator();
    const environment = DSmodelEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer
    const scoper = environment.scoper;
    const unparser = environment.writer;

    test("names in model with 1 unit of depth 2", () => {
        const model: DSmodel = creator.createModel(1, 2);
        // run the scoper to test all names in the model
        const visibleNames = getVisibleNames(scoper.getVisibleNodes(model));
        // printDifference(creator, visibleNames);
        // print("names in model of depth 2: ", visibleNames);
        for (const x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });
});
