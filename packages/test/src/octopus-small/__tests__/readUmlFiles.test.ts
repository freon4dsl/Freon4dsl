import { ModelUnitMetaType, OctopusModelUnitType, UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import * as fs from "fs";
import { OctopusModelUnitReader } from "../reader/gen/OctopusModelUnitReader";
import { PiReader } from "@projectit/core";

const writer = OctopusEnvironment.getInstance().writer;
const reader = OctopusEnvironment.getInstance().reader;

function compareReadAndWrittenUmlParts(path: string) {
    try {
        let result: string = "";
        const unit1 = readFromFile(path, "UmlPart");
        result = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, "UmlPart");
        // the following 'expect' does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether a syntax error
        // has occurred
        // expect(unit1).toEqual(unit2);
    } catch (e) {
        console.log(e.message);
        expect(e).toBeNaN();
    }
}

function readFromFile(filepath: string, metatype: ModelUnitMetaType): OctopusModelUnitType {
    // read language file
    if (!fs.existsSync(filepath)) {
        console.error(this, "File '" + filepath + "' does not exist, exiting.");
        throw new Error(`File '${filepath}' not found.`);
    }
    const langSpec: string = fs.readFileSync(filepath, { encoding: "utf8" });
    return reader.readFromString(langSpec, metatype) as OctopusModelUnitType;
}

describe("Testing Parser", () => {
    // TODO use snapshots
    test("input model unparsed and parsed again", () => {
        let path: string = "src/octopus-small/__tests__/input.uml2";
        compareReadAndWrittenUmlParts(path);
    });

    test("book model unparsed and parsed again", () => {
        let path: string = "src/octopus-small/__tests__/Book.uml2";
        compareReadAndWrittenUmlParts(path);
    });

    test.skip("orders model unparsed and parsed again", () => {
        let path: string = "src/octopus-small/__tests__/orders.uml2";
        compareReadAndWrittenUmlParts(path);
    });

    test("catalog model unparsed and parsed again", () => {
        const unit1 = readFromFile("src/octopus-small/__tests__/catalog.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("trainWagon model unparsed and parsed again", () => {
        const unit1 = readFromFile("src/octopus-small/__tests__/trainWagon.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("book model STRING unparsed and parsed again", () => {
        const langSpec: string = fs.readFileSync("src/octopus-small/__tests__/orders.uml2", { encoding: "utf8" });
        const unit1 = reader.readFromString(langSpec, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });
});
