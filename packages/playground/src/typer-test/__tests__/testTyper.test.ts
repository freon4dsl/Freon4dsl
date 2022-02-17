import { GenericModelSerializer } from "@projectit/core";
import { FileHandler } from "../../octopus/__tests__/FileHandler";
import { TyTestEnvironment } from "../environment/gen/TyTestEnvironment";
import { TyTestModelUnitType, UnitA, UnitB, UnitC } from "../language/gen";

const writer = TyTestEnvironment.getInstance().writer;
const reader = TyTestEnvironment.getInstance().reader;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();
const metatype: string = "UnitA";
const testdir = "src/typer-test/__inputs__/";

function compareReadAndWrittenFiles(path: string) {
    try {
        const unit1 = reader.readFromString(handler.stringFromFile(path), metatype) as TyTestModelUnitType;
        let result: string = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, metatype);
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

describe ("Testing Typer Ideas", () => {

    test ("read types", () => {
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "myTypeDefinitions.types"), "UnitB") as UnitB;
        expect(unit1).not.toBeNull();
        expect(unit1.typeDefs.length).not.toBe(0);
    });

    test ("read expressions", () => {
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "simpleLines.expr"), "UnitA") as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            console.log(writer.writeToString(unit1));
        }
    });

    test ("read unitC", () => {
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "simpleLines.tmp"), "UnitC") as UnitC;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            console.log(writer.writeToString(unit1));
        }
    });
});
