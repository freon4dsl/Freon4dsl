import { LanguageParser } from "../../../languagedef/parser/LanguageParser";

describe("Checking language parser on syntax errors", () => {
    const parser = new LanguageParser();
    const testdir = "src/test/__tests__/language-tests/faultyDefFiles/syntax-errors/";

    test("language name should not contain a dot", () => {
        const parseFile = testdir + "test2.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("properties cannot be initialized", () => {
        const parseFile = testdir + "test3.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("instances of limited concepts should have a name", () => {
        const parseFile = testdir + "test5.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("property definitions should end in semicolon", () => {
        const parseFile = testdir + "test6.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("only a single '?' can be used for optional properties", () => {
        const parseFile = testdir + "test7.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("concepts may have only one base concept", () => {
        const parseFile = testdir + "test8.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("interfaces may not implement other interfaces", () => {
        const parseFile = testdir + "test9.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("instances of limited concepts should have some properties", () => {
        const parseFile = testdir + "test10.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });

    test("model and modelunit should have a name", () => {
        const parseFile = testdir + "test1.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`syntax error.`);
        }
    });
});
