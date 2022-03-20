import { NewPiTyperParser } from "../../typerdef/new-parser";
import { PiLanguage } from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { PiTyperDef } from "../../typerdef/new-metalanguage";

describe("Checking new typer", () => {
    const testdir = "src/__tests__/new-typer-tests/correctDefFiles/";
    const langParser = new LanguageParser();

    let parser: NewPiTyperParser;
    let language: PiLanguage;
    // MetaLogger.muteAllLogs();
    // MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = langParser.parse(testdir + "projectX.ast");
            parser = new NewPiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read: " + e.stack);
            // console.log("found errors in .ast: " + langParser.checker.errors.map(e => e).join("\n"));
        }
    });

    test(" on projectX.type file", () => {
        if(!!language) {
            const conc = language.concepts.find(x => x.name === "NumberLiteral");
            expect(conc).not.toBeNull();
            expect(conc).not.toBeUndefined();

            const typeClassifier = language.conceptsAndInterfaces().find(x => x.name === "Type");
            expect(typeClassifier).not.toBeNull();
            expect(typeClassifier).not.toBeUndefined();

            let typeUnit: PiTyperDef;
            try {
                if (!!parser) {
                    typeUnit = parser.parse(testdir + "projectX.type");
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
            }
    });

});
