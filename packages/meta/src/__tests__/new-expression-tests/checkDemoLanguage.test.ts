import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew";
import { MetaLogger } from "../../utils/index.js";
import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { describe, test, expect } from "vitest";

describe("Checking expression parser on syntax errors", () => {
    const testdir = "src/__tests__/new-expression-tests/expressionDefFiles/";
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
        const parser = new LanguageExpressionParserNew(demoLanguage!);
        const checker = parser.checker;
        const demoExpressionFile = testdir + "demoExpressions.fretest";
        try {
            const xx = parser.parse(demoExpressionFile);
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (7).`);
                expect(
                  checker.errors.includes(
                    "Variable 'expr' should be known as property in classifier 'DemoEntity' [file: demoExpressions.fretest:5:19].",
                  ),
                );
                expect(
                  checker.errors.includes(
                    "Variable 'int_attr' should be known as property in classifier 'DemoEntity' [file: demoExpressions.fretest:11:10].",
                  ),
                ).toBeTruthy();
                expect(
                  checker.errors.includes(
                    "Variable 'attrutes' should be known as property in classifier 'DemoEntity' [file: demoExpressions.fretest:13:10].",
                  ),
                ).toBeTruthy();
                expect(
                  checker.errors.includes(
                    "Function 'conformsTo()' should have a parameter [file: demoExpressions.fretest:27:23].",
                  ),
                ).toBeTruthy();
                expect(
                  checker.errors.includes(
                    "Instance 'Inter' is not a predefined instance of DemoAttributeType [file: demoExpressions.fretest:15:5].",
                  ),
                ).toBeTruthy();
                expect(
                  checker.errors.includes(
                    "Variable 'extra' should be known as property in classifier 'DemoVariable' [file: demoExpressions.fretest:33:10].",
                  ),
                ).toBeTruthy();
            }
        }
    });
});
