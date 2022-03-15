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
            language = new LanguageParser().parse(testdir + "playgroundDefs/types.ast");
            parser = new NewPiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read: " + e.stack);
        }
    });

    test( " on playground def files", () => {
        try {
            const conc = language.concepts.find(x => x.name === "NumberLiteral");
            expect(conc).not.toBeNull();
            expect(conc).not.toBeUndefined();
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "playgroundDefs/type-rules.type");

                const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "NumberLiteral");
                expect(simpleExpRule).not.toBeNull();

                expect(typeUnit.types.find(t => t.name === "PredefinedType")).toBeTruthy();
                expect(typeUnit.types.find(t => t.name === "NamedType")).toBeTruthy();
                expect(typeUnit.types.find(t => t.name === "SimpleType")).toBeTruthy();
                expect(typeUnit.types.find(t => t.name === "GenericType")).toBeTruthy();
                expect(typeUnit.types.find(t => t.name === "UnitOfMeasurement")).toBeTruthy();
                expect(typeUnit.types.find(t => t.name === "TypeDeclaration")).toBeTruthy();
                expect(typeUnit.types.length).toBe(6);
                expect(typeUnit.conceptsWithType.find(t => t.name === "NumberLiteral")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "StringLiteral")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "BooleanLiteral")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "NamedExp")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "PlusExp")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "UnitLiteral")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "GenericLiteral")).toBeTruthy();
                expect(typeUnit.conceptsWithType.find(t => t.name === "Exp")).toBeTruthy();
                expect(typeUnit.conceptsWithType.length).toBe(8);
                // console.log(typeUnit.conceptsWithType.map(t => t.name).join(", "))
                expect(typeUnit.anyTypeRule).not.toBeNull();
                expect(typeUnit.typeRoot).not.toBeNull();
                expect(typeUnit.typeRoot).not.toBeUndefined();
            }
        } catch (e) {
            // expect(e).toBeNaN();
            console.log(e.stack);
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
        }
    });
});
