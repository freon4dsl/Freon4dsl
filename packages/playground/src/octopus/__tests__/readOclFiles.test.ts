import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import { FileHandler } from "./FileHandler";
import { GenericModelSerializer } from "@projectit/core";
import { ModelUnitMetaType, OctopusModelUnitType } from "../language/gen";

const writer = OctopusEnvironment.getInstance().writer;
const reader = OctopusEnvironment.getInstance().reader;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();

function compareReadAndWrittenOclParts(path: string) {
    try {
        const unit1 = readFromFile(path, "OclPart");
        let result: string = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, "OclPart");
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        const unit1_json = serial.convertToJSON(unit1);
        const unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
    } catch (e) {
        console.log(e.message);
        expect(e).toBeNaN();
    }
}

function readFromFile(filepath: string, metatype: ModelUnitMetaType): OctopusModelUnitType {
    // read language file
    const langSpec = handler.stringFromFile(filepath);
    return reader.readFromString(langSpec, metatype) as OctopusModelUnitType;
}

describe("Testing Parser for OCl part", () => {

    // TODO use snapshots
    test("Period unparsed and parsed again", () => {
        compareReadAndWrittenOclParts("src/octopus/__inputs__/Period.ocl");
    });

    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("src/octopus/__inputs__/Appendix.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("src/octopus/__inputs__/Bookpart.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("src/octopus/__inputs__/Chapter.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("src/octopus/__inputs__/Prependix.ocl");
    // });
});
