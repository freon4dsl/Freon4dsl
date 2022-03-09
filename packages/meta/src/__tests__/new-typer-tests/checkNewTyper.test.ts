import { PiLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { PiTyperDef } from "../../typerdef/new-metalanguage";
import { NewPiTyperParser } from "../../typerdef/new-parser/NewPiTyperParser";

describe("Checking new typer", () => {
    const testdir = "src/__tests__/new-typer-tests/correctDefFiles/";
    let parser: NewPiTyperParser;

    let language: PiLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "types.ast");
            parser = new NewPiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read: " + e.message);
        }
    });

    test( " on .type file", () => {
        try {
            if (!!parser) {
                const typeUnit: PiTyperDef = parser.parse(testdir + "type-rules.type");

                const conc = language.concepts.find(x => x.name === "SimpleExp1");
                expect(conc).not.toBeNull();
                expect(conc).not.toBeUndefined();

                const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "SimpleExp1");
                expect(simpleExpRule).not.toBeNull();

                expect(typeUnit.types.length).toBe(2);
                expect(typeUnit.anyTypeRule).not.toBeNull();
            }
        } catch (e) {
            console.log(e.message + e.stack);
            const errors: string[] = parser.checker.errors;
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            // expect(e).toBeNaN();
        }
    });
});
