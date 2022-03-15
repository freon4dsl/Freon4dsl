import { GenericModelSerializer, PiError } from "@projectit/core";
import { FileHandler } from "../../octopus/__tests__/FileHandler";
import { TyTest, TyTestModelUnitType, UnitA, UnitB } from "../language/gen";
import { TyTestEnvironment } from "../environment/gen/TyTestEnvironment";

const writer = TyTestEnvironment.getInstance().writer;
const reader = TyTestEnvironment.getInstance().reader;
const validator = TyTestEnvironment.getInstance().validator;
const serial: GenericModelSerializer = new GenericModelSerializer();
const handler = new FileHandler();
const metatype: string = "UnitA";
const testdir = "src/typer-test/__inputs__/";

function compareReadAndWrittenFiles(path: string) {
    try {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(path), metatype, model) as TyTestModelUnitType;
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

    test ("read types", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "myTypeDefinitions.types"), "UnitB", model) as UnitB;
        expect(unit1).not.toBeNull();
        expect(unit1.typeDefs.length).not.toBe(0);
    });

    test ("literal expressions", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "literals.expr"), "UnitA", model) as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(6);
            expect(errors.find(e => e.message === "Type NUMBER of [456] is not equal to STRING")).toBeTruthy();
            expect(errors.find(e => e.message === "Type NUMBER of [456] is not equal to BOOLEAN")).toBeTruthy();
            expect(errors.find(e => e.message === "Type STRING of [\"string\"] is not equal to NUMBER")).toBeTruthy();
            expect(errors.find(e => e.message === "Type STRING of [\"string\"] is not equal to BOOLEAN")).toBeTruthy();
            expect(errors.find(e => e.message === "Type BOOLEAN of [true] is not equal to STRING")).toBeTruthy();
            expect(errors.find(e => e.message === "Type BOOLEAN of [true] is not equal to NUMBER")).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("literal expressions with complex types", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "literalsWithComplexTypes.expr"), "UnitA", model) as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(10);
            expect(errors.find(e => e.message === "Type NUMBER of [12] is not equal to kWh")).toBeTruthy();
            expect(errors.find(e => e.message === "Type NUMBER of [456] is not equal to Collection < Grams >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type STRING of [\"string\"] is not equal to Set < Bag < Hours > >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type BOOLEAN of [true] is not equal to Meters")).toBeTruthy();
            expect(errors.find(e => e.message === "Type NUMBER of [100] is not equal to Set < BOOLEAN >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type STRING of [\"string\"] is not equal to Bag < Set < NUMBER > >")).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("complex expressions with simple types", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "complexExpWithSimpleTypes.expr"), "UnitA", model) as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.length).toBe(2);
            expect(errors.find(e => e.message === "Type Set < BOOLEAN > of [Set { true, true, false }] is not equal to BOOLEAN")).toBeTruthy();
            expect(errors.find(e => e.message === "Type Bag < Set < NUMBER > > of [Bag { Set { 12, 13, 14 }, Sequence { \"string\", \"Str\", \"STRING\" } }] is not equal to NUMBER")).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("complex expressions with complex types", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "complexExpWithComplexTypes.expr"), "UnitA", model) as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            expect(errors.find(e => e.message === "Type Set < BOOLEAN > of [Set { true, true, false }] is not equal to Set < NUMBER >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type Bag < Set < NUMBER > > of [Bag { Set { 12, 13, 14 }, Sequence { \"string\", \"Str\", \"STRING\" } }] is not equal to Bag < Sequence < NUMBER > >")).toBeTruthy();
            expect(errors.find(e => e.message === "Type Meters of [124 Meters] is not equal to kWh")).toBeTruthy();
            expect(errors.find(e => e.message === "Reference 'kWh' should have type 'Type', but found type(s) [UnitKind]")).toBeTruthy();
            expect(errors.length).toBe(4);

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test ("expressions with correct types", () => {
        const model = new TyTest();
        const unit1 = reader.readFromString(handler.stringFromFile(testdir + "correctExps.expr"), "UnitA", model) as UnitA;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: PiError[] = validator.validate(unit1);
            // expect(errors.length).toBe(0);
            // TODO still problems with UnitLiteral: "Type Meters of [124 Meters] is not equal to Meters"

            console.log(errors.map(e => e.message).join("\n"));
        }
    });
});
