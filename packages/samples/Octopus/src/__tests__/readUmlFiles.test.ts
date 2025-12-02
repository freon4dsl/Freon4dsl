import {OctopusModel, UmlPart} from "../freon/language/index.js";
import { OctopusModelEnvironment } from "../freon/config/OctopusModelEnvironment.js";
import { FreModelSerializer } from "@freon4dsl/core"
import {describe, test, expect} from "vitest";
import { FileUtil } from "@freon4dsl/test-helpers"

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;
const serial: FreModelSerializer = new FreModelSerializer();

function compareReadAndWrittenUmlParts(filepath: string) {
    try {
        const model: OctopusModel = new OctopusModel();
        const langSpec: string = FileUtil.stringFromFile('./packages/samples/Octopus/src/__inputs__/' + filepath);
        const unit1 = reader.readFromString(langSpec, "UmlPart", model) as UmlPart;
        unit1.name = "unit1";
        let result: string = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        // handler.stringToFile(filepath + "2", result);
        const unit2 = reader.readFromString(result, "UmlPart", model) as UmlPart;
        unit2.name = "unit1"; // the names should be the same in the comparison, but may not be the same in the reader method!!!
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        const unit1_json = serial.convertToJSON(unit1);
        const unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
    } catch (e) {
        console.log(e.message + e.stack);
        // expect(e).toBeNaN();
    }
}

describe("Testing Parser", () => {
    // TODO use snapshots
    test("book unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("Book.uml2");
    });

    test("orders model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("orders.uml2");
    });

    test("catalog model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("catalog.uml2");
    });

    test("trainWagon model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("trainWagon.uml2");
    });
});
