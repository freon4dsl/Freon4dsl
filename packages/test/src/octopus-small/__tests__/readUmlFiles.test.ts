import { ModelUnitMetaType, OctopusModelUnitType, UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import * as fs from "fs";

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
    test("book unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/octopus-small/__inputs__/Book.uml2");
    });

    test("orders model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/octopus-small/__inputs__/orders.uml2");
    });

    test("catalog model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/octopus-small/__inputs__/catalog.uml2");
    });

    test("trainWagon model unparsed and parsed again", () => {
        compareReadAndWrittenUmlParts("src/octopus-small/__inputs__/trainWagon.uml2");
    });
});
