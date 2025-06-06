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
            console.log(xx.toFreString())
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (10).`);
                expect(
                    checker.errors.includes(
                        "List property 'entities' cannot have an applied expression (.expr) [file: demoExpressions.fretest:5:10].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Cannot find property or classifier 'int_attr' in 'DemoEntity' [file: demoExpressions.fretest:11:10].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Cannot find property or classifier 'attrutes' in 'DemoEntity' [file: demoExpressions.fretest:13:10].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Inter is not a predefined instance of DemoAttributeType [file: demoExpressions.fretest:15:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "List property 'attributes' cannot have an applied expression (.type()) [file: demoExpressions.fretest:17:10].",
                    ),
                );
                expect(
                    checker.errors.includes(
                        "Cannot establish the type of 'owner()'. Maybe add '.if()'. [file: demoExpressions.fretest:18:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Cannot find property or classifier 'xx' in 'DemoEntity' [file: demoExpressions.fretest:19:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Cannot find property or classifier 'extra' in 'DemoVariable' [file: demoExpressions.fretest:33:10].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A dot-expression is not allowed after a classifier, maybe you meant '#DemoVariable:<instance>' [file: demoExpressions.fretest:23:6].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A dot-expression is not allowed after a classifier, maybe you meant '#DemoFunction:<instance>' [file: demoExpressions.fretest:29:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });
});
