import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage';

import { LanguageExpressionTesterNew } from "../../langexpressions/parser/LanguageExpressionTesterNew.js";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew.js";

import { describe, test, expect, beforeEach } from "vitest";
import { Checker } from '../../utils';

describe("Checking the expression checker", () => {
    const testdir = "src/__tests__/new-expression-tests/expressionDefFiles/";
    let parser: LanguageExpressionParserNew;
    let checker: Checker<LanguageExpressionTesterNew>;
    let language: FreMetaLanguage | undefined;

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        parser = new LanguageExpressionParserNew(language);
        checker = parser.checker;
    });

    test("todo", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.fretest");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (1).`);
                    checker.errors.forEach((error) =>
                      expect(error).toBe("There should be a model in your language [file: test1.ast:1:1]."),
                    );
                }
            }
        }
    });
});
