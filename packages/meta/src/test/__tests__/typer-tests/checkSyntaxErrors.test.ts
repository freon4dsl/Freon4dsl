import { PiTyperParser } from "../../../typerdef/parser/PiTyperParser";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { LanguageParser } from "../../../languagedef/parser/LanguageParser";

describe("Checking typer on checking errors", () => {
    const testdir = "src/test/__tests__/typer-tests/faultyDefFiles/syntax-errors/";
    let parser: PiTyperParser;
    let language: PiLanguage;

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/test/__tests__/typer-tests/test-language.ast");
            parser = new PiTyperParser(language);
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("language should have a name", () => {
        // TODO implement all tests
        const parseFile = testdir + "test1.type";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });


});
