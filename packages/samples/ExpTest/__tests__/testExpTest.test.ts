import { GenericModelSerializer } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import { ExpTestEnvironment } from "../environment/gen/ExpTestEnvironment";
import { ExpTestModelUnitType, Test, Unit1 } from "../language/gen";

const writer = ExpTestEnvironment.getInstance().writer;
const reader = ExpTestEnvironment.getInstance().reader;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();
const metaType: string = "UnitA";
const testdir = "src/expressions/__tests__/";

function compareReadAndWrittenFiles(path: string) {
    try {
        const model: Test = new Test();
        const unit1 = reader.readFromString(handler.stringFromFile(path), metaType, model) as ExpTestModelUnitType;
        let result: string = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, metaType, model);
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

describe ("Testing expressions backwards", () => {

    test ("read", () => {
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "input.xxx"), "Unit1", new Test()) as Unit1;
        expect(unit1).not.toBeNull();
        console.log(writer.writeToString(unit1))
        // console.log(unit1.unitPart);
        // console.log(unit1.unitPart.exp.map(e => e).join(";\n"));
    });

});
