import {OclPart, OctopusModel, UmlPart} from "../freon/language/index.js";
import { OctopusModelEnvironment } from "../freon/config/OctopusModelEnvironment";
import { FreModelSerializer } from "@freon4dsl/core";
import { FileUtil } from '@freon4dsl/test-helpers';
import {describe, test, expect} from "vitest";

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;
const serial: FreModelSerializer = new FreModelSerializer();

function compareReadAndWrittenOclParts(path: string) {
    const unit1 = readFromFile<OclPart>(path, "OclPart");
    let result: string = writer.writeToString(unit1, 0, false);
    expect(result.length).toBeGreaterThan(0);
    const unit2 = reader.readFromString(result, "OclPart", new OctopusModel());
    // simply comparing the units does not work because the id properties of the two units
    // are not the same, therefore we use the hack of checking whether both units in JSON
    // format are the same
    const unit1_json = serial.convertToJSON(unit1);
    const unit2_json = serial.convertToJSON(unit2);
    expect(unit1_json).toEqual(unit2_json);
}

function readFromFile<T>(filepath: string, metatype: string): T {
    // read language file
    const langSpec = FileUtil.stringFromFile('./packages/samples/Octopus/src/__inputs__/' + filepath);
    return reader.readFromString(langSpec, metatype, new OctopusModel()) as T;
}

describe("Testing Parser for OCl part", () => {

    // TODO use snapshots
    test("Period unparsed and parsed again", () => {
        compareReadAndWrittenOclParts("/Period.ocl");
    });

    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("/Appendix.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("/Bookpart.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("/Chapter.ocl");
    // });
    //
    // test("Period unparsed and parsed again", () => {
    //     compareReadAndWrittenOclParts("/Prependix.ocl");
    // });
});
