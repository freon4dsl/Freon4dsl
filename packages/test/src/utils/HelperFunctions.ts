import { FreModelSerializer, FreModel, FreModelUnit, FreReader, FreWriter } from "@freon4dsl/core";
import { FileHandler } from "./FileHandler";

const serial: FreModelSerializer = new FreModelSerializer();
const handler = new FileHandler();

export function compareReadAndWrittenUnits(reader: FreReader, writer: FreWriter, model: FreModel, filepath: string, metatype: string) {
    try {
        const langSpec: string = handler.stringFromFile(filepath);
        const unit1 = reader.readFromString(langSpec, metatype, model);
        let result: string = writer.writeToString(unit1, 0, false);
        // console.log(result);
        // handler.stringToFile(filepath+ "out", result);
        expect(result.length).toBeGreaterThan(0);
        (unit1 as FreModelUnit).name = "somethingDifferent"; // name should be unique during reading and adding of unit2
        const unit2 = reader.readFromString(result, metatype, model);
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        // Note that also the names should be equal, therefore ...
        (unit1 as FreModelUnit).name = (unit2 as FreModelUnit).name;
        const unit1_json = serial.convertToJSON(unit1);
        const unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
    } catch (e) {
        // console.log(e.message);
        expect(e).toBeNaN();
    }
}

function getShortFileName(filename: string): string {
    let names: string[] = [];
    if (filename.includes("\\")) {
        names = filename.split("\\");
    } else if (filename.includes("/")) {
        names = filename.split("/");
    }
    return names[names.length - 1];
}
