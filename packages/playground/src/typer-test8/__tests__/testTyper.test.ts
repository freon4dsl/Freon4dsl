import { GenericModelSerializer, PiError } from "@projectit/core";
import { FileHandler } from "../../octopus/__tests__/FileHandler";
import { ProjectYModelUnitType, XXunit, XX } from "../language/gen";
import { ProjectYEnvironment } from "../environment/gen/ProjectYEnvironment";

const writer = ProjectYEnvironment.getInstance().writer;
const reader = ProjectYEnvironment.getInstance().reader;
const validator = ProjectYEnvironment.getInstance().validator;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();
const metatype: string = "XXunit";
const testdir = "src/typer-test8/__inputs__/";

function compareReadAndWrittenFiles(path: string) {
    try {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(path), metatype, model) as ProjectYModelUnitType;
        let result: string = writer.writeToString(unit1, 0, false);
        expect(result.length).toBeGreaterThan(0);
        const unit2 = reader.readFromString(result, metatype, model);
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

    test ("literal expressions", () => {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "literals.expr"), "XXunit", model) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(6);
            expect(errors.find(e => e.message === "Type 'NUMBER' of [456] is not equal to STRING")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'NUMBER' of [456] is not equal to BOOLEAN")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'STRING' of [\"string\"] is not equal to NUMBER")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'STRING' of [\"string\"] is not equal to BOOLEAN")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'BOOLEAN' of [true] is not equal to STRING")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'BOOLEAN' of [true] is not equal to NUMBER")).toBeTruthy();

            console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("literal expressions with complex types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "literalsWithComplexTypes.expr"), "XXunit", model) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(6);
            expect(errors.find(e => e.message === "Type 'NUMBER' of [12] is not equal to kWh < NUMBER >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'NUMBER' of [456] is not equal to Collection < Grams < NUMBER > >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'STRING' of [\"string\"] is not equal to Set < Bag < Hours < NUMBER > > >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'BOOLEAN' of [true] is not equal to Meters < NUMBER >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'NUMBER' of [100] is not equal to Set < BOOLEAN >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'STRING' of [\"string\"] is not equal to Bag < Set < NUMBER > >")).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("complex expressions with simple types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "complexExpWithSimpleTypes.expr"), "XXunit", model) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            // console.log(writer.writeToString(unit1));
            const errors: PiError[] = validator.validate(unit1);
            // expect(errors.length).toBe(7);
            // expect(errors.find(e => e.message === "Type 'Set < BOOLEAN >' of [Set { true, true, false }] is not equal to BOOLEAN")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Sequence < STRING >' of [Sequence { true, 12 }] is not equal to STRING")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Collection < STRING > >' of [Bag { Set { 12, 13, 14 }, Sequence { \"string\", \"Str\", \"STRING\" } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Set < NUMBER >' of [Set { 12, 13, 14 }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Set < NUMBER > >' of [Bag { Set { 12, 13, 14 }, Set { 2, 3, 4 } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Set < Set < NUMBER > > >' of [Bag { Set { Set { 2, 3, 4 }, Set { 12, 13, 14 } }, Set { Set { 2, 3, 4 } } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Set < ANY >' of [Set { }] is not equal to STRING")).toBeTruthy();
            console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("complex expressions with complex types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "complexExpWithComplexTypes.expr"), "XXunit", model) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.find(e => e.message === "Type 'Set < BOOLEAN >' of [Set { true, true, false }] is not equal to Set < NUMBER >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'Bag < Collection < STRING > >' of [Bag { Set { 12, 13, 14 }, Sequence { \"string\", \"Str\", \"STRING\" } }] is not equal to Bag < Sequence < NUMBER > >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type 'Meters < NUMBER >' of [124 Meters] is not equal to kWh < NUMBER >")).toBeTruthy();
            expect(errors.length).toBe(3);

            console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("expressions with correct types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "correctExps.expr"), "XXunit", model) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(0);

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });
});
