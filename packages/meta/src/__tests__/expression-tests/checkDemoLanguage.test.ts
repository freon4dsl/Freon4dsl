import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { LanguageExpressionParser } from "../../languagedef/parser/LanguageExpressionParser";
import { MetaLogger } from "../../utils";

describe("Checking expression parser on syntax errors", () => {
    const testdir = "src/__tests__/expression-tests/expressionDefFiles/";
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

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
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (9).`);
            expect(checker.errors.includes("List property 'entities' should not have an applied expression (.expr) [file: demoExpressions.pitest:5:9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'expr' in 'DemoEntity' [file: demoExpressions.pitest:5:18]."));
            expect(checker.errors.includes("Cannot find property 'int_attr' in 'DemoEntity' [file: demoExpressions.pitest:11:9].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'attrutes' in 'DemoEntity' [file: demoExpressions.pitest:13:9].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.pitest:19:14].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.pitest:23:6].")).toBeTruthy();
            expect(checker.errors.includes("Function 'conformsTo' in 'DemoFunction' should have 2 parameters, found 1 [file: demoExpressions.pitest:27:5].")).toBeTruthy();
            expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.pitest:29:5].")).toBeTruthy();
            expect(checker.errors.includes("Cannot find property 'extra' in 'DemoVariable' [file: demoExpressions.pitest:33:9].")).toBeTruthy();
        }
    });
});
