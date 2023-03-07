import { FreLionwebSerializer } from "@freon4dsl/core";
import * as fs from "fs";
// import {SimpleformsEnvironment } from "../config/gen/SimpleformsEnvironment";
import { FileHandler } from "../../utils/FileHandler";

import { FreNode, FreNodeReference } from "@freon4dsl/core";
import { LIonWebM3Environment } from "../config/gen/LIonWebM3Environment";

function printModel(element: FreNode): string {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"];// "$id"];

function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof FreNodeReference) {
        return "REF => " + value.pathname + " (" + value.referred["LIonCore_M3_NamespacedEntity_simpleName"] + ") of type: " + value.typeName;
    }else {
        return value;
    }
}

describe("Testing Parser", () => {

    beforeEach(done => {
        LIonWebM3Environment.getInstance();
        done();
    });

    test("Parse library metamodel", () => {
        const path: string = "./src/lionwebM3/__tests__/meta/library.json";
        const fileHandler = new FileHandler();
        const readModel = fs.readFileSync(path, "utf-8");

        const json = JSON.parse(readModel);

        const serial = new FreLionwebSerializer();
        const tsObject = serial.toTypeScriptInstance(json);

        console.log(LIonWebM3Environment.getInstance().writer.writeToString(tsObject));
        expect(100).not.toBeNull();
    });

    test("Parse TestLang metamodel", () => {
        const path: string = "./src/lionwebM3/__tests__/meta/TestLang.json";
        const fileHandler = new FileHandler();
        const readModel = fs.readFileSync(path, "utf-8");

        const json = JSON.parse(readModel);

        const serial = new FreLionwebSerializer();
        const tsObject = serial.toTypeScriptInstance(json);

        console.log("==> " + LIonWebM3Environment.getInstance().writer.writeToString(tsObject));
        expect(100).not.toBeNull();
    });

    // test("Parse SimpleForm metamodel", () => {
    //     const path: string = "./src/lionwebM3/__tests__/meta/simpleform.json";
    //     const fileHandler = new FileHandler();
    //     const readModel = fs.readFileSync(path, "utf-8");
    //
    //     const json = JSON.parse(readModel);
    //
    //     const serial = new FreLionwebSerializer();
    //     const tsObject = serial.toTypeScriptInstance(json);
    //
    //     console.log(printModel(tsObject));
    //     expect(100).not.toBeNull();
    // });
});
