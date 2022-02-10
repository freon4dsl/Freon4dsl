import { GenericModelSerializer, PiReader, PiWriter } from "@projectit/core";
import { FileHandler } from "./FileHandler";

const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();

export function compareReadAndWrittenUnits(reader: PiReader, writer: PiWriter, filepath: string, metatype: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, metatype);
        let result: string = writer.writeToString(unit1, 0, false);
        // console.log(result);
        // handler.stringToFile(filepath+ "out", result);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, metatype);
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        const unit1_json = serial.convertToJSON(unit1);
        const unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
    } catch (e) {
        // console.log(e.message);
        expect(e).toBeNaN();
    }
}
