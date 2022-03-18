import { PiLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { PitInferenceRule, PiTyperDef } from "../../typerdef/new-metalanguage";
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
            console.log("Language could not be read: " + e.stack);
        }
    });

    test( " on correct .type file", () => {
        const conc = language.concepts.find(x => x.name === "SimpleExp1");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();

        const typeClassifier = language.interfaces.find(x => x.name === "Type");
        expect(typeClassifier).not.toBeNull();
        expect(typeClassifier).not.toBeUndefined();

        let typeUnit: PiTyperDef
        try {
            if (!!parser) {
                typeUnit = parser.parse(testdir + "correctDefFiles/type-rules.type");
            }
        } catch (e) {
            console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }

        // expect(typeUnit).not.toBeNull();
        // expect(typeUnit).not.toBeUndefined();
        // expect(typeUnit.types.length).toBe(7);
        // expect(typeUnit.conceptsWithType.length).toBe(7);
        // expect(typeUnit.anyTypeRule).not.toBeNull();
        //
        // const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "SimpleExp1");
        // expect(simpleExpRule).not.toBeNull();
        // const plusExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "PlusExp");
        // expect(plusExpRule).not.toBeNull();
        // expect(plusExpRule instanceof PitInferenceRule).toBeTruthy();
        // expect((plusExpRule as PitInferenceRule).returnType).toBe(typeClassifier);
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
            expect(e.message).toBe(`checking errors (8).`);
            expect(errors.includes("Concept or interface 'Type' occurs more than once in this list [file: type-rules1.type, line: 4, column: 10].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'Exp' occurs more than once in this list [file: type-rules1.type, line: 7, column: 11].")).toBeTruthy();
            expect(errors.includes("Cannot find instance 'Simp' of 'PredefinedType' [file: type-rules1.type, line: 20, column: 30].")).toBeTruthy();
            expect(errors.includes("Expected type 'PredefinedType', but found type 'NamedType' [file: type-rules1.type, line: 28, column: 15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'base' [file: type-rules1.type, line: 38, column: 21].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'inn' [file: type-rules1.type, line: 38, column: 48].")).toBeTruthy();
            expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules1.type, line: 46, column: 16].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof' cannot be determined, please provide an expected type [file: type-rules1.type, line: 46, column: 9].")).toBeTruthy();
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
            expect(e.message).toBe(`checking errors (12).`);
            expect(errors.includes("Concept or interface 'SimpleType' is not marked 'hasType', therefore it cannot have an infertype rule [file: type-rules2.type, line: 19, column: 1].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof' cannot be determined, please provide an expected type [file: type-rules2.type, line: 38, column: 39].")).toBeTruthy();
            expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules2.type, line: 46, column: 16].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof' cannot be determined, please provide an expected type [file: type-rules2.type, line: 46, column: 9].")).toBeTruthy();
            expect(errors.includes("Type of 'typeof' cannot be determined, please provide an expected type [file: type-rules2.type, line: 46, column: 38].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'SimpleExp1' is not marked 'isType', therefore it cannot have a conforms or equals rule [file: type-rules2.type, line: 52, column: 1].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'type' [file: type-rules2.type, line: 53, column: 19].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 64, column: 15].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'kind' [file: type-rules2.type, line: 65, column: 15].")).toBeTruthy();
            expect(errors.includes("Concept or interface 'GenericLiteral' is not marked 'isType' [file: type-rules2.type, line: 67, column: 18].")).toBeTruthy();
            expect(errors.includes("Cannot find property 'innerType' [file: type-rules2.type, line: 69, column: 41].")).toBeTruthy();
            expect(errors.includes("Concept 'SimpleExp1' is marked 'hasType', but has no 'inferType' rule [file: type-rules2.type, line: 1, column: 1].")).toBeTruthy();
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
            console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            // TODO finish this
            // expect(e.message).toBe(`checking errors (2).`);
            // expect(errors.includes("Reference to property 'x' is not allowed [file: type-rules4.type, line: 38, column: 26].")).toBeTruthy();
            // expect(errors.includes("Types of 'Exp' and 'TypeDeclaration' do not conform [file: type-rules4.type, line: 46, column: 9].")).toBeTruthy();
        }
    });

    test( " on multiple files", () => {
        // the content of the typeUnit should be exactly the same as from "correctDefFiles/type-rules.type"
        const conc = language.concepts.find(x => x.name === "SimpleExp1");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();

        const typeClassifier = language.interfaces.find(x => x.name === "Type");
        expect(typeClassifier).not.toBeNull();
        expect(typeClassifier).not.toBeUndefined();

        let typeUnit: PiTyperDef
        try {
            typeUnit = parser.parseMulti(
                [testdir + "multiFileInput/type-rules1.type",
                    testdir + "multiFileInput/type-rules2.type"]);
        } catch (e) {
            console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }

        expect(typeUnit).not.toBeNull();
        expect(typeUnit).not.toBeUndefined();
        expect(typeUnit.types.length).toBe(7);
        expect(typeUnit.conceptsWithType.length).toBe(7);
        expect(typeUnit.anyTypeRule).not.toBeNull();
        expect(typeUnit.anyTypeRule).not.toBeUndefined();

        const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "SimpleExp1");
        expect(simpleExpRule).not.toBeNull();
        const plusExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "PlusExp");
        expect(plusExpRule).not.toBeNull();
        expect(plusExpRule instanceof PitInferenceRule).toBeTruthy();
        expect((plusExpRule as PitInferenceRule).returnType).toBe(typeClassifier);
    });
});
