import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { LanguageExpressionParser } from "../../../languagedef/parser/LanguageExpressionParser";

describe("Checking expression parser on syntax errors", () => {
    const testdir = "src/test/__tests__/expression-tests/expressionDefFiles/";

    beforeEach(() => {
        try {
            const language = new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("original test on demo language", () => {
        const demoLanguage = new LanguageParser().parse(testdir + "demoLanguage.ast");
        if (demoLanguage === null) {
            throw new Error("Demo Language could not be parsed, exiting.");
        }
        const parser = new LanguageExpressionParser(demoLanguage);
        const checker = parser.checker;
        const demoExpressionFile = testdir + "demoExpressions.pitest";
        try {
            const readTest = parser.parse(demoExpressionFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("List property 'entities' should not have an applied expression (.expr) [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 5, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'expr' in 'DemoEntity' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 5, column: 18]."));
            expect(checker.errors.includes("Cannot find property 'int_attr' in 'DemoEntity' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 11, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'attrutes' in 'DemoEntity' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 13, column: 9].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 19, column: 14].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 23, column: 6].")).toBeTruthy();
            expect(checker.errors.includes("Function 'conformsTo' in 'DemoFunction' should have 2 parameters, found 1 [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 27, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 29, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'extra' in 'DemoVariable' [file: src/test/__tests__/expression-tests/expressionDefFiles/demoExpressions.pitest, line: 33, column: 9].")).toBeTruthy();
        }
    });
});
