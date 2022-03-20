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

    test( " on correct .ast and .type file", () => {
        const conc = language.concepts.find(x => x.name === "NumberLiteral");
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
