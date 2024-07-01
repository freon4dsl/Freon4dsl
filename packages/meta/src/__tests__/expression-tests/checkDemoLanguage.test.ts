import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { LanguageExpressionParser } from "../../languagedef/parser/LanguageExpressionParser";
import { MetaLogger } from "../../utils";
import {FreMetaLanguage} from "../../languagedef/metalanguage";

describe("Checking expression parser on syntax errors", () => {
    const testdir = "src/__tests__/expression-tests/expressionDefFiles/";
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    test("read testLanguage", () => {
        try {
            new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: ");
            }
        }
    });

    test("original test on demo language", () => {
        const demoLanguage: FreMetaLanguage | undefined = new LanguageParser().parse(testdir + "demoLanguage.ast");
        expect(demoLanguage).not.toBeNull();
        expect(demoLanguage).not.toBeUndefined();
        const parser = new LanguageExpressionParser(demoLanguage!);
        const checker = parser.checker;
        const demoExpressionFile = testdir + "demoExpressions.fretest";
        try {
            parser.parse(demoExpressionFile);
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (9).`);
                expect(checker.errors
                    .includes("List property 'entities' should not have an applied expression (.expr) [file: demoExpressions.fretest:5:9].")).toBeTruthy();
                expect(checker.errors.includes("Cannot find property 'expr' in 'DemoEntity' [file: demoExpressions.fretest:5:18]."));
                expect(checker.errors.includes("Cannot find property 'int_attr' in 'DemoEntity' [file: demoExpressions.fretest:11:9].")).toBeTruthy();
                expect(checker.errors.includes("Cannot find property 'attrutes' in 'DemoEntity' [file: demoExpressions.fretest:13:9].")).toBeTruthy();
                expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.fretest:19:14].")).toBeTruthy();
                expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.fretest:23:6].")).toBeTruthy();
                expect(checker.errors
                    .includes("Function 'conformsTo' in 'DemoFunction' should have 2 parameters, found 1 [file: demoExpressions.fretest:27:5].")).toBeTruthy();
                expect(checker.errors.includes("Expression should start with 'self' [file: demoExpressions.fretest:29:5].")).toBeTruthy();
                expect(checker.errors.includes("Cannot find property 'extra' in 'DemoVariable' [file: demoExpressions.fretest:33:9].")).toBeTruthy();
            }
        }
    });
});
