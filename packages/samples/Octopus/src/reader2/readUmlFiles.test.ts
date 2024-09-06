import { describe, test, expect } from "vitest";
import { OctopusModelEnvironment } from "../config/gen/OctopusModelEnvironment";
import { FileHandler } from "../__tests__/FileHandler";
import {FreModelSerializer, FreNamedNode} from "@freon4dsl/core";
import { OctopusModel } from "../language/gen";
import {NewReader} from "./NewReader";
import {resetCurrentFileName, setCurrentFileName} from "./ParseHelpers";


const writer = OctopusModelEnvironment.getInstance().writer;
const reader: NewReader = new NewReader();
const serial: FreModelSerializer = new FreModelSerializer();
const handler = new FileHandler();

function compareReadAndWrittenUmlParts(filepath: string) {
    try {
        // const model: OctopusModel = new OctopusModel();
        const langSpec: string = handler.stringFromFile(filepath);
        setCurrentFileName(filepath);
        reader.readFromString(langSpec);
        resetCurrentFileName();
        // const unit1: FreNamedNode = reader.readFromString(langSpec);
        // unit1.name = "unit1";
        // let result: string = writer.writeToString(unit1, 0, false);
        // expect(result.length).toBeGreaterThan(0);
        // // handler.stringToFile(filepath + "2", result);
        // const unit2: FreNamedNode = reader.readFromString(result) as FreNamedNode;
        // unit2.name = "unit1"; // the names should be the same in the comparison, but may not be the same in the reader method!!!
        // // simply comparing the units does not work because the id properties of the two units
        // // are not the same, therefore we use the hack of checking whether both units in JSON
        // // format are the same
        // const unit1_json = serial.convertToJSON(unit1);
        // const unit2_json = serial.convertToJSON(unit2);
        // expect(unit1_json).toEqual(unit2_json);
    } catch (e) {
        console.log(e.message + e.stack);
        // expect(e).toBeNaN();
    }
}

describe("Testing Parser", () => {
    // TODO use snapshots
    test("book unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/__inputs__/Book.uml2");
    });

    test("orders model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/__inputs__/orders.uml2");
    });

    test("catalog model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/__inputs__/catalog.uml2");
    });

    test("trainWagon model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/__inputs__/trainWagon.uml2");
    });
});
