import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage';

import { LanguageExpressionTesterNew } from "../../langexpressions/parser/LanguageExpressionTesterNew.js";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew.js";

import { describe, test, expect, beforeEach } from "vitest";
import { Checker, MetaLogger } from '../../utils';

describe("Checking the expression checker", () => {
    const testdir = "src/__tests__/new-expression-tests/expressionDefFiles/";
    let parser: LanguageExpressionParserNew;
    let checker: Checker<LanguageExpressionTesterNew>;
    let language: FreMetaLanguage | undefined;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

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

    test("Error message should be given", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.fretest");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (15).`);
                    expect(checker.errors.includes("Cannot find property 'AAprop14' in 'CC' [file: test-faulty1.fretest:9:18].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find classifier 'AAprop14' in language 'ROOT' [file: test-faulty1.fretest:9:18].")).toBeTruthy();
                    expect(checker.errors.includes("Parameter 'self.AAprop14' of if() should denote a classifier [file: test-faulty1.fretest:9:10].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'SOMETHING' in 'CC' [file: test-faulty1.fretest:10:13].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find classifier 'SOMETHING' in language 'ROOT' [file: test-faulty1.fretest:10:13].")).toBeTruthy();
                    expect(checker.errors.includes("Parameter 'SOMETHING' of if() should denote a classifier [file: test-faulty1.fretest:10:10].")).toBeTruthy();
                    expect(checker.errors.includes("Function if() should have a parameter [file: test-faulty1.fretest:11:10].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot limit to classifier 'Extra', it is not a possible subtype ([BB]) [file: test-faulty1.fretest:12:10].")).toBeTruthy();
                    expect(checker.errors.includes("Function owner() may not have a parameter [file: test-faulty1.fretest:16:5].")).toBeTruthy();
                    expect(checker.errors.includes("'self' should be followed by '.', followed by a property [file: test-faulty1.fretest:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot limit to classifier 'Extra', it is not a possible subtype ([]) [file: test-faulty1.fretest:18:18].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot establish the type of 'if(Extra)'. [file: test-faulty1.fretest:18:18].")).toBeTruthy();
                    expect(checker.errors.includes("A dot-expression is not allowed after 'type()' [file: test-faulty1.fretest:22:5].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'peer' in 'Extra' [file: test-faulty1.fretest:27:18].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find classifier 'peer' in language 'ROOT' [file: test-faulty1.fretest:27:18].")).toBeTruthy();
                }
            }
        }
    });
});
