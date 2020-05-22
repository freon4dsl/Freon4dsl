import { LanguageParser } from "../../parser/LanguageParser";
import { LanguageExpressionParser } from "../../parser/LanguageExpressionParser";

describe("Checking expression parser on syntax errors", () => {
    let testdir = "src/languagedef/__tests__/expression-tests/expressionDefFiles/syntax-errors/";

    beforeEach(() => {
        try {
            let language = new LanguageParser().parse("src/languagedef/__tests__/expression-tests/expressionDefFiles/testLanguage.lang");
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("original test on demo language", () => {
        let demoLanguage = new LanguageParser().parse("src/languagedef/__tests__/expression-tests/expressionDefFiles/demoLanguage.lang");
        if (demoLanguage == null) {
            throw new Error("Demo Language could not be parsed, exiting.");
        }
        let parser = new LanguageExpressionParser(demoLanguage);
        let checker = parser.checker;
        let demoExpressionFile = "src/languagedef/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest";
        try {
            const readTest = parser.parse(demoExpressionFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("List property 'entities' should not have an applied expression (.expr) [line: 5, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'expr' in 'DemoEntity' [line: 5, column: 18]."));
            expect(checker.errors.includes("Cannot find property 'int_attr' in 'DemoEntity' [line: 11, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'attrutes' in 'DemoEntity' [line: 13, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [line: 19, column: 14].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [line: 23, column: 6].")).toBeTruthy();
            expect(checker.errors.includes("Function 'conformsTo' in 'DemoFunction' should have 2 parameters, found 1 [line: 27, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [line: 29, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'extra' in 'DemoVariable' [line: 33, column: 9].")).toBeTruthy();
        }
    });

});
