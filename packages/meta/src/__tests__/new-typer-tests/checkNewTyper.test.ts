import { PiLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { PiTyperDef } from "../../typerdef/new-metalanguage";
import { NewPiTyperParser } from "../../typerdef/new-parser/NewPiTyperParser";

describe("Checking new typer", () => {
    const testdir = "src/__tests__/new-typer-tests/";
    let parser: NewPiTyperParser;

    let language: PiLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "correctDefFiles/types.ast");
            parser = new NewPiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read: " + e.message);
        }
    });

    test( " on correct .type file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "correctDefFiles/type-rules.type");

                const conc = language.concepts.find(x => x.name === "SimpleExp1");
                expect(conc).not.toBeNull();
                expect(conc).not.toBeUndefined();

                const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "SimpleExp1");
                expect(simpleExpRule).not.toBeNull();

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            expect(e).toBeNaN();
            // console.log(e.message + e.stack);
            const errors: string[] = parser.checker.errors;
            expect(errors.length).toBe(0);
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }
    });

    test( " on type-rules1 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules1.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.message + e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (5).`);
            expect(errors.includes("Concept or interface 'Type' occurs more than once in this list [file: type-rules1.type, line: 4, column: 10].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'Exp' occurs more than once in this list [file: type-rules1.type, line: 7, column: 11].")).toBeTruthy();
            expect(errors.includes("Cannot find instance 'Simp' of 'PredefinedType' [file: type-rules1.type, line: 20, column: 30].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'base' [file: type-rules1.type, line: 38, column: 21].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'inn' [file: type-rules1.type, line: 38, column: 47].")).toBeTruthy();
        }
    });

    test( " on type-rules2 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules2.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (7).`);
            expect(errors.includes("Concept or interface 'SimpleType' is not marked 'hasType', therefore it cannot have an infertype rule [file: type-rules2.type, line: 19, column: 1].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'SimpleExp1' is not marked 'isType', therefore it cannot have a conforms or equals rule [file: type-rules2.type, line: 52, column: 1].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'type' [file: type-rules2.type, line: 53, column: 19].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 64, column: 15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'kind' [file: type-rules2.type, line: 65, column: 15].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'GenericLiteral' is not marked 'isType' [file: type-rules2.type, line: 67, column: 18].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 69, column: 41].")).toBeTruthy();
        }
    });
});
