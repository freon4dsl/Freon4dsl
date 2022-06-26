import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";

describe("Checking language parser on syntax errors", () => {
    const parser = new LanguageParser();
    const testdir = "src/__tests__/language-tests/faultyDefFiles/syntax-errors/";
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    test("model and modelunit should have a name", () => {
        const parseFile = testdir + "test1.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message);
            expect(e.message).toBe(`syntax error: SyntaxError: Expected variable but "{" found.`
                + " \n                "
                +`[file: test1.ast, line: 2, column: 8]`);
        }
    });

    test("language name should not contain a dot", () => {
        const parseFile = testdir + "test2.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected required whitespace but "." found.`
                + " \n                "
                +`[file: test2.ast, line: 1, column: 14]`);
        }
    });

    test("properties cannot be initialized", () => {
        const parseFile = testdir + "test3.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected ":" or "?" but "[" found.`
                + " \n                "
                +`[file: test3.ast, line: 10, column: 22]`);
        }
    });

    test("instances of limited concepts should have a name", () => {
        const parseFile = testdir + "test5.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected "private", "reference", "}", or variable but "=" found.`
                + " \n                "
                +`[file: test5.ast, line: 12, column: 5]`);
        }
    });

    test("property definitions should end in semicolon", () => {
        const parseFile = testdir + "test6.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected ";", "=", or "[]" but "p" found.`
                + " \n                "
                +`[file: test6.ast, line: 11, column: 5]`);
        }
    });

    test("only a single '?' can be used for optional properties", () => {
        const parseFile = testdir + "test7.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected ":" but "?" found.`
                + " \n                "
                +`[file: test7.ast, line: 10, column: 10]`);
        }
    });

    test("concepts may have only one base concept", () => {
        const parseFile = testdir + "test8.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected "implements" or "{" but "," found.`
                + " \n                "
                +`[file: test8.ast, line: 9, column: 23]`);
        }
    });

    test("interfaces may not implement other interfaces", () => {
        const parseFile = testdir + "test9.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected "base" or "{" but "i" found.`
                + " \n                "
                +`[file: test9.ast, line: 9, column: 16]`);
        }
    });

    test("instances of limited concepts should have some properties", () => {
        const parseFile = testdir + "test10.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error: SyntaxError: Expected "\\"" or variable but "}" found.`
                + " \n                "
                +`[file: test10.ast, line: 11, column: 21]`);
        }
    });

});
