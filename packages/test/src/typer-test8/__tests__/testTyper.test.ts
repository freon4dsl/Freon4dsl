import { FreModelSerializer, FreError, FreModelUnit } from "@freon4dsl/core";
import { XXunit, XX } from "../language/gen";
import { XXEnvironment } from "../config/gen/XXEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { describe, test, expect, beforeEach } from "vitest";

const writer = XXEnvironment.getInstance().writer;
const reader = XXEnvironment.getInstance().reader;
const validator = XXEnvironment.getInstance().validator;
const serial: FreModelSerializer = new FreModelSerializer();
const handler = new FileHandler();
const metatype: string = "XXunit";
const testdir = "src/typer-test8/__inputs__/";

// TODO test the PlusExp and introduce some NamedTypes

describe("Testing Typer on", () => {
    // TODO make an input file in which a number of NamedTypes are created and used

    beforeEach(() => {
        XXEnvironment.getInstance();
    });

    test("literal expressions", () => {
        const model = new XX();
        const unit1 = reader.readFromString(
            handler.stringFromFile(testdir + "literals.expr"),
            "XXunit",
            model,
            testdir + "literals.expr"
        ) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: FreError[] = validator.validate(unit1);
            // console.log("ERRORS: " + errors.map(e => e.message + "\n"));
            expect(errors.length).toBe(6);
            expect(errors.find((e) => e.message === "Type 'NUMBER' of [456] is not equal to STRING")).toBeTruthy();
            expect(errors.find((e) => e.message === "Type 'NUMBER' of [456] is not equal to BOOLEAN")).toBeTruthy();
            expect(
                errors.find((e) => e.message === "Type 'STRING' of [\"string\"] is not equal to NUMBER"),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message === "Type 'STRING' of [\"string\"] is not equal to BOOLEAN"),
            ).toBeTruthy();
            expect(errors.find((e) => e.message === "Type 'BOOLEAN' of [true] is not equal to STRING")).toBeTruthy();
            expect(errors.find((e) => e.message === "Type 'BOOLEAN' of [true] is not equal to NUMBER")).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test("literal expressions with complex types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(
            handler.stringFromFile(testdir + "literalsWithComplexTypes.expr"),
            "XXunit",
            model,
            testdir + "literalsWithComplexTypes.expr"
        ) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: FreError[] = validator.validate(unit1);
            expect(errors.length).toBe(6);
            expect(
                errors.find((e) => e.message === "Type 'NUMBER' of [12] is not equal to kWh < NUMBER >"),
            ).toBeTruthy();
            expect(
                errors.find(
                    (e) => e.message === "Type 'NUMBER' of [456] is not equal to Collection < Grams < NUMBER > >",
                ),
            ).toBeTruthy();
            expect(
                errors.find(
                    (e) =>
                        e.message === "Type 'STRING' of [\"string\"] is not equal to Set < Bag < Hours < NUMBER > > >",
                ),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message === "Type 'BOOLEAN' of [true] is not equal to Meters < NUMBER >"),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message === "Type 'NUMBER' of [100] is not equal to Set < BOOLEAN >"),
            ).toBeTruthy();
            expect(
                errors.find(
                    (e) => e.message === "Type 'STRING' of [\"string\"] is not equal to Bag < Set < NUMBER > >",
                ),
            ).toBeTruthy();

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test("complex expressions with simple types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(
            handler.stringFromFile(testdir + "complexExpWithSimpleTypes.expr"),
            "XXunit",
            model,
        ) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            // console.log(writer.writeToString(unit1));
            const errors: FreError[] = validator.validate(unit1);
            expect(errors.length).toBe(7);
            // Because type concepts do no have a projection, their unparsing is not ok yet.
            // Therefore, the next 7 lines are replaced
            // expect(errors.find(e => e.message === "Type 'Set < BOOLEAN >' of [Set { true, true, false }] is not equal to BOOLEAN")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Sequence < STRING >' of [Sequence { true, 12 }] is not equal to STRING")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Collection < STRING > >' of [Bag { Set { 12, 13, 14 }, Sequence { \"string\", \"Str\", \"STRING\" } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Set < NUMBER >' of [Set { 12, 13, 14 }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Set < NUMBER > >' of [Bag { Set { 12, 13, 14 }, Set { 2, 3, 4 } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Bag < Set < Set < NUMBER > > >' of [Bag { Set { Set { 2, 3, 4 }, Set { 12, 13, 14 } }, Set { Set { 2, 3, 4 } } }] is not equal to NUMBER")).toBeTruthy();
            // expect(errors.find(e => e.message === "Type 'Set < ANY >' of [Set { }] is not equal to STRING")).toBeTruthy();
            expect(
                errors.find((e) => e.message.endsWith("of [Set { true, true, false }] is not equal to BOOLEAN")),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message.endsWith("of [Sequence { true, 12 }] is not equal to STRING")),
            ).toBeTruthy();
            expect(
                errors.find((e) =>
                    e.message.endsWith(
                        'of [Bag { Set { 12, 13, 14 }, Sequence { "string", "Str", "STRING" } }] is not equal to NUMBER',
                    ),
                ),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message.endsWith("of [Set { 12, 13, 14 }] is not equal to NUMBER")),
            ).toBeTruthy();
            expect(
                errors.find((e) =>
                    e.message.endsWith("of [Bag { Set { 12, 13, 14 }, Set { 2, 3, 4 } }] is not equal to NUMBER"),
                ),
            ).toBeTruthy();
            expect(
                errors.find((e) =>
                    e.message.endsWith(
                        "of [Bag { Set { Set { 2, 3, 4 }, Set { 12, 13, 14 } }, Set { Set { 2, 3, 4 } } }] is not equal to NUMBER",
                    ),
                ),
            ).toBeTruthy();
            expect(errors.find((e) => e.message.endsWith("of [Set { }] is not equal to STRING"))).toBeTruthy();
            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test("complex expressions with complex types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(
            handler.stringFromFile(testdir + "complexExpWithComplexTypes.expr"),
            "XXunit",
            model,
        ) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: FreError[] = validator.validate(unit1);
            console.log(errors.map(err => err.message).join("=\n=") + "==\n ====")
            expect(errors.length).toBe(3);
            expect(
                errors.find((e) => e.message.includes("of [Set { true, true, false }] is not equal to Set < NUMBER >")),
            ).toBeTruthy();
            expect(
                errors.find((e) =>
                    e.message.includes(
                        'of [Bag { Set { 12, 13, 14 }, Sequence { "string", "Str", "STRING" } }] is not equal to Bag < Sequence < NUMBER > >',
                    ),
                ),
            ).toBeTruthy();
            expect(
                errors.find((e) => e.message.includes("of [124Meters] is not equal to kWh < NUMBER >")),
            ).toBeTruthy();


            // console.log(errors.map(e => e.message).join("\n"));
        }
    });

    test("expressions with correct types", () => {
        const model = new XX();
        const unit1 = reader.readFromString(
            handler.stringFromFile(testdir + "correctExps.expr"),
            "XXunit",
            model,
        ) as XXunit;
        expect(unit1).not.toBeNull();
        if (!!unit1) {
            const errors: FreError[] = validator.validate(unit1);
            expect(errors.length).toBe(0);

            // console.log(errors.map(e => e.message).join("\n"));
        }
    });
});
