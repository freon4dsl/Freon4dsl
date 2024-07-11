"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@freon4dsl/core");
var FileHandler_1 = require("../../UnusedOrInvalid/utils/FileHandler");
var ExpTestEnvironment_1 = require("../environment/gen/ExpTestEnvironment");
var gen_1 = require("../language/gen");
var writer = ExpTestEnvironment_1.ExpTestEnvironment.getInstance().writer;
var reader = ExpTestEnvironment_1.ExpTestEnvironment.getInstance().reader;
var serial = new core_1.GenericModelSerializer();
var handler = new FileHandler_1.FileHandler();
var metaType = "UnitA";
var testdir = "src/expressions/__tests__/";
function compareReadAndWrittenFiles(path) {
    try {
        var model = new gen_1.Test();
        var unit1 = reader.readFromString(handler.stringFromFile(path), metaType, model);
        var result = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        var unit2 = reader.readFromString(result, metaType, model);
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        var unit1_json = serial.convertToJSON(unit1);
        var unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
    }
    catch (e) {
        console.log(e.message);
        expect(e).toBeNaN();
    }
}
describe("Testing expressions backwards", function () {
    test("read", function () {
        var unit1 = reader.readFromString(handler.stringFromFile(testdir + "input.xxx"), "Unit1", new gen_1.Test());
        expect(unit1).not.toBeNull();
        console.log(writer.writeToString(unit1));
        // console.log(unit1.unitPart);
        // console.log(unit1.unitPart.exp.map(e => e).join(";\n"));
    });
});
