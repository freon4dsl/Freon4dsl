import { PiLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { PiTyperDef } from "../../typerdef/metalanguage";
import { PiTyperMerger } from "../../typerdef/parser/PiTyperMerger";

describe("Checking new typer", () => {
    const testdir = "src/__tests__/typer-tests/faultyDefFiles/";
    let parser: PiTyperMerger;

    let language: PiLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "types.ast");
            parser = new PiTyperMerger(language);
        } catch (e) {
            console.log("Language could not be read: " + e.stack);
        }
    });

    test( " on type-rules1 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules1.type");

                expect(typeUnit).not.toBeNull();
                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeSpec).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (8).`);
            expect(errors.includes("Concept or interface 'Type' occurs more than once in this list [file: type-rules1.type:4:10].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'Exp' occurs more than once in this list [file: type-rules1.type:7:11].")).toBeTruthy();
            expect(errors.includes("Cannot find instance 'Simp' of 'PredefinedType' [file: type-rules1.type:20:30].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'inn' in classifier 'UnitLiteral' [file: type-rules1.type:38:37].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'base' [file: type-rules1.type:38:19].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof( self.content )' (${Names.FreType}) does not conform to TypeDeclaration [file: type-rules1.type:46:9].")).toBeTruthy();
            expect(errors.includes("Property may not be present twice [file: type-rules1.type:66:13].")).toBeTruthy();
            expect(errors.includes("Property may not be present twice [file: type-rules1.type:90:32].")).toBeTruthy();
        }
    });

    test( " on type-rules2 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules2.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeSpec).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (10).`);
            expect(errors.includes("Concept or interface 'SimpleType' is not marked 'hastype', therefore it cannot have an infertype rule [file: type-rules2.type:20:5].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'inn' in classifier 'UnitLiteral' [file: type-rules2.type:38:37].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'base' [file: type-rules2.type:38:19].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof( self.content )' (${Names.FreType}) does not conform to TypeDeclaration [file: type-rules2.type:46:9].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'SimpleExp1' is not marked 'istype', therefore it cannot have an equals rule [file: type-rules2.type:53:5].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'type' in classifier 'SimpleExp1' [file: type-rules2.type:53:19].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' in classifier 'NamedType' [file: type-rules2.type:64:15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'kind' in classifier 'NamedType' [file: type-rules2.type:65:15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' in classifier 'GenericLiteral' [file: type-rules2.type:69:41].")).toBeTruthy();
            expect(errors.includes("Concept 'SimpleExp1' is marked 'hasType', but has no 'inferType' rule [file: types.ast:32:1].")).toBeTruthy();
        }
    });

    test( " on type-rules4 file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules4.type");

                expect(typeUnit.types.length).toBe(7);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeSpec).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            expect(e.message).toBe(`checking errors (3).`);
            expect(errors.includes("Cannot find property 'base' [file: type-rules4.type:38:19].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof( self.content )' (${Names.FreType}) does not conform to TypeDeclaration [file: type-rules4.type:46:9].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'name' in classifier '${Names.FreType}' [file: type-rules4.type:70:49].")).toBeTruthy();
        }
    });

    test.skip( " on type-rules5 file", () => {
        // TODO this one gives a parse error: "NullPointerException", wait for David to come back on this
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules5.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeSpec).not.toBeNull();
            }
        } catch (e) {
            console.log(e.stack); // returns NullPointerException!!
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }
    });

    test.skip( " on type-rules6 file", () => {
        // TODO make new input file
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules6.type");

                expect(typeUnit.types.length).toBe(8);
                expect(typeUnit.conceptsWithType.length).toBe(7);
                expect(typeUnit.anyTypeSpec).not.toBeNull();
            }
        } catch (e) {
            // console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            // expect(errors.length).toBe(4);
            // expect(errors.includes("Result 'PredefinedType' (from SimpleExp1) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type:46:31].")).toBeTruthy();
            // expect(errors.includes("Result 'PredefinedType' (from SimpleExp2) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type:46:31].")).toBeTruthy();
            // expect(errors.includes("Result 'NamedType' (from NamedExp) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type:46:31].")).toBeTruthy();
            // expect(errors.includes("Result 'Type' (from PlusExp) of 'typeof( self.content )' does not conform to expected type (TypeDeclaration) [file: type-rules6.type:46:31].")).toBeTruthy();
        }
    });
});
