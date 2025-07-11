import { FreMetaLanguage } from '../../languagedef/metalanguage';
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import { TyperDef } from '../../typerdef/metalanguage';
import { FreTyperMerger } from '../../typerdef/parser';
import { describe, test, expect, beforeEach } from "vitest";
import { FretClassifierSpec } from "../../typerdef/metalanguage"

describe("Checking new typer", () => {
    const testdir = "src/__tests__/typer-tests/";
    let parser: FreTyperMerger;
    let language: FreMetaLanguage | undefined;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "playgroundDefs/types.ast");
            if (!!language) {
                parser = new FreTyperMerger(language);
            } else {
                console.log('No language!')
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: " + e.stack);
            }
        }
    });

    test(" on playground faulty def files", () => {
        const conc = language!.concepts.find((x) => x.name === "NumberLiteral");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();
        const conc2 = language!.concepts.find((x) => x.name === "PredefinedType");
        expect(conc2).not.toBeNull();
        expect(conc2).not.toBeUndefined();
        expect(conc2.constructor.name).toBe('FreMetaLimitedConcept');
        try {
            if (!!parser) {
                parser.parse(testdir + "playgroundDefs/type-rules.type");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.stack);
                const errors: string[] = parser.checker.errors;
                // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
                expect(errors.length).toBe(2);
                expect(
                    errors.includes(
                        "A 'where' expression may not be used in an 'infertype' rule, please use 'Concept {...}' [file: type-rules.type:41:5].",
                    ),
                ).toBeTruthy();
                expect(
                    errors.includes(
                        "A 'where' expression may not be used in an 'infertype' rule, please use 'Concept {...}' [file: type-rules.type:49:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test(" on playground correct def files", () => {
        const conc = language!.concepts.find((x) => x.name === "NumberLiteral");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();
        const conc2 = language!.concepts.find((x) => x.name === "PredefinedType");
        expect(conc2).not.toBeNull();
        expect(conc2).not.toBeUndefined();
        expect(conc2.constructor.name).toBe('FreMetaLimitedConcept');
        try {
        if (!!parser) {
            const typeUnit: TyperDef | undefined = parser.parse(testdir + "playgroundDefs/type-rules2.type");
            expect(typeUnit).not.toBeNull();
            expect(typeUnit).not.toBeUndefined();

            const simpleExpRule: FretClassifierSpec | undefined = typeUnit!.classifierSpecs.find(
                (rule) => rule.myClassifier?.name === "NumberLiteral",
            );
            expect(simpleExpRule).not.toBeNull();
            expect(simpleExpRule).not.toBeUndefined();

            // console.log(typeUnit!.types.map(tt => tt.name).join(", "));
            expect(typeUnit!.types.length).toBe(7);
            expect(typeUnit!.types.find((t) => t.name === "PredefinedType")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "NamedType")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "SimpleType")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "GenericType")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "UnitOfMeasurement")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "TypeDeclaration")).toBeTruthy();
            expect(typeUnit!.types.find((t) => t.name === "Type")).toBeTruthy();

            expect(typeUnit!.conceptsWithType.find((t) => t.name === "NumberLiteral")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "StringLiteral")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "BooleanLiteral")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "NamedExp")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "PlusExp")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "UnitLiteral")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "GenericLiteral")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.find((t) => t.name === "Exp")).toBeTruthy();
            expect(typeUnit!.conceptsWithType.length).toBe(8);
            // console.log(typeUnit.conceptsWithType.map(t => t.name).join(", "))
            expect(typeUnit!.anyTypeSpec).not.toBeNull();
            expect(typeUnit!.typeRoot).not.toBeNull();
            expect(typeUnit!.typeRoot).not.toBeUndefined();
        }
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.error(e);
                const errors: string[] = parser.checker.errors;
                if (errors && errors.length > 0) {
                    console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
                }
            }
        }
    });
});
