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
            language = new LanguageParser().parse(testdir + "types.ast");
            parser = new NewPiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read: " + e.stack);
        }
    });

    test( " on type-rules1 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules1.type");

                expect(typeUnit).not.toBeNull();
                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (11).`);
            expect(errors.includes("Concept or interface 'Type' occurs more than once in this list [file: type-rules1.type, line: 4, column: 10].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'Exp' occurs more than once in this list [file: type-rules1.type, line: 7, column: 11].")).toBeTruthy();
            expect(errors.includes("Cannot find instance 'Simp' of 'PredefinedType' [file: type-rules1.type, line: 20, column: 30].")).toBeTruthy();
            expect(errors.includes("Expected type 'PredefinedType', but found type 'NamedType' [file: type-rules1.type, line: 28, column: 15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'base' [file: type-rules1.type, line: 38, column: 21].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'inn' [file: type-rules1.type, line: 38, column: 48].")).toBeTruthy();
            expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules1.type, line: 46, column: 16].")).toBeTruthy();
            expect(errors.includes("Result 'TypeDeclaration' (from PlusExp) of 'typeof( self.content )' does not conform to expected type (Type) [file: type-rules1.type, line: 46, column: 39].")).toBeTruthy();
            expect(errors.includes("Result 'UnitOfMeasurement' (from UnitLiteral) of 'typeof( self.content )' does not conform to expected type (Type) [file: type-rules1.type, line: 46, column: 39].")).toBeTruthy();
            expect(errors.includes("Result 'GenericType' (from GenericLiteral) of 'typeof( self.content )' does not conform to expected type (Type) [file: type-rules1.type, line: 46, column: 39].")).toBeTruthy();
            expect(errors.includes("Types of 'TypeDeclaration' and 'Type' do not conform [file: type-rules1.type, line: 46, column: 9].")).toBeTruthy();
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
            expect(e.message).toBe(`checking errors (10).`);
            expect(errors.includes("Concept or interface 'SimpleType' is not marked 'hasType', therefore it cannot have an infertype rule [file: type-rules2.type, line: 19, column: 1].")).toBeTruthy();
            expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules2.type, line: 46, column: 16].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'SimpleExp1' is not marked 'isType', therefore it cannot have a conforms or equals rule [file: type-rules2.type, line: 52, column: 1].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'type' [file: type-rules2.type, line: 53, column: 19].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 64, column: 15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'kind' [file: type-rules2.type, line: 65, column: 15].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'GenericLiteral' is not marked 'isType' [file: type-rules2.type, line: 67, column: 18].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 69, column: 41].")).toBeTruthy();
            expect(errors.includes("Concept 'SimpleExp1' is marked 'hasType', but has no 'inferType' rule [file: type-rules2.type, line: 1, column: 1].")).toBeTruthy();
            expect(errors.includes("Cannot find inferType rule(s) for 'self.inner' (of type 'SimpleExp1') [file: type-rules2.type, line: 38, column: 39].")).toBeTruthy();
        }
    });

    test( " on type-rules4 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules4.type");

                expect(typeUnit.types.length).toBe(7);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (1).`);
            expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules4.type, line: 38, column: 26].")).toBeTruthy();
        }
    });

    test( " on type-rules5 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules5.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            console.log(e.stack); // returns NullPointerException!! TODO
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }
    });

    test( " on type-rules6 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "faultyDefFiles/type-rules6.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            expect(errors.length).toBe(4);
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(errors.includes("Result 'PredefinedType' (from SimpleExp1) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type, line: 46, column: 31].")).toBeTruthy();
            expect(errors.includes("Result 'PredefinedType' (from SimpleExp2) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type, line: 46, column: 31].")).toBeTruthy();
            expect(errors.includes("Result 'NamedType' (from NamedExp) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type, line: 46, column: 31].")).toBeTruthy();
            expect(errors.includes("Result 'Type' (from PlusExp) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type, line: 46, column: 31].")).toBeTruthy();
        }
    });
});
