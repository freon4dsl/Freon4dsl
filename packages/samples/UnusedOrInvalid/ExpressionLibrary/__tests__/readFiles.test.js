"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("packages/core/src");
var FileHandler_1 = require("./FileHandler");
var ExpressionLibraryEnvironment_1 = require("../environment/gen/ExpressionLibraryEnvironment");
var gen_1 = require("../language/gen");
var writer = ExpressionLibraryEnvironment_1.ExpressionLibraryEnvironment.getInstance().writer;
var reader = ExpressionLibraryEnvironment_1.ExpressionLibraryEnvironment.getInstance().reader;
var serial = new src_1.GenericModelSerializer();
var handler = new FileHandler_1.FileHandler();
function compareReadAndWrittenOclParts(path) {
    var unit1 = readFromFile(path, "LibUnit");
    expect(unit1).not.toBeNull();
    var result = writer.writeToString(unit1, 0, false);
    expect(result.length).toBeGreaterThan(0);
    var unit2 = reader.readFromString(result, "LibUnit", new gen_1.LIB_USAGE());
    // simply comparing the units does not work because the id properties of the two units
    // are not the same, therefore we use the hack of checking whether both units in JSON
    // format are the same
    var unit1_json = serial.convertToJSON(unit1);
    var unit2_json = serial.convertToJSON(unit2);
    expect(unit1_json).toEqual(unit2_json);
}
function readFromFile(filepath, metatype) {
    // read language file
    var langSpec = handler.stringFromFile(filepath);
    return reader.readFromString(langSpec, metatype, new gen_1.LIB_USAGE());
}
describe("Testing Parser for expression library", function () {
    // TODO use snapshots
    test("Numeric expressions unparsed and parsed again", function () {
        compareReadAndWrittenOclParts("src/libraries-test/__inputs__/numerics.lts");
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
