import { PiTyperParser } from "../../typerdef/parser/PiTyperParser";
import { PiLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";

describe("Checking typer on syntax errors", () => {
    const testdir = "src/__tests__/typer-tests/faultyDefFiles/syntax-errors/";
    let parser: PiTyperParser;
    let language: PiLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
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
            expect(e.message).toBe(`syntax error: SyntaxError: Expected "abstract", "conformsto", "equalsto", "infertype", or "}" but "c" found.`
                + " \n                "
                +`[file: test1.type, line: 6, column: 5]`);
        }
    });


});