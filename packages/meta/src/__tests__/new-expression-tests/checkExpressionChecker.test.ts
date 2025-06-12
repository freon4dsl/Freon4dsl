import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage';
import { LanguageExpressionTesterNew } from "../../langexpressions/parser/LanguageExpressionTesterNew.js";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew.js";
import { describe, test, expect, beforeEach } from "vitest";
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { Checker } from '../../utils/basic-dependencies/index.js';

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

    test("Error messages should be given", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.fretest");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    // console.log(e.message, e.stack)
                    // checker.errors.forEach(err => console.log(err));
                    expect(e.message).toBe(`checking errors (14).`);
                    expect(checker.errors.includes("Cannot find property 'ff' in classifier 'BB' [file: test-faulty1.fretest:5:5].")).toBeTruthy();
                    expect(checker.errors.includes("Instance 'instanceZ1' is not a predefined instance of ZZ [file: test-faulty1.fretest:9:5].")).toBeTruthy();
                    expect(checker.errors.includes("Parameter 'self.AAprop14' of 'if()' should denote a classifier [file: test-faulty1.fretest:10:10].")).toBeTruthy();
                    expect(checker.errors.includes("Parameter 'SOMETHING' of 'if()' should denote a classifier [file: test-faulty1.fretest:11:10].")).toBeTruthy();
                    expect(checker.errors.includes("Function 'if()' should have a parameter [file: test-faulty1.fretest:12:10].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot limit to classifier 'Extra', it is not a possible value ([BB]) [file: test-faulty1.fretest:13:10].")).toBeTruthy();
                    expect(checker.errors.includes("Function 'owner()' may not have a parameter [file: test-faulty1.fretest:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("'self' should be followed by '.', followed by a property [file: test-faulty1.fretest:18:5].")).toBeTruthy();                    expect(checker.errors.includes("Function 'owner()' may not have a parameter [file: test-faulty1.fretest:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot limit to classifier 'CC', it is not a possible value ([EE, FF]) [file: test-faulty1.fretest:19:18].")).toBeTruthy();                    expect(checker.errors.includes("Function 'owner()' may not have a parameter [file: test-faulty1.fretest:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("'self' should be followed by '.', followed by a property [file: test-faulty1.fretest:18:5].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'aap' in classifier 'FF' [file: test-faulty1.fretest:20:25].")).toBeTruthy();
                    expect(checker.errors.includes("A dot-expression is not allowed after 'type()' [file: test-faulty1.fretest:24:5].")).toBeTruthy();
                    expect(checker.errors.includes("'self' may only appear at the start of an expression [file: test-faulty1.fretest:25:11].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'cc' in classifier 'EE' [file: test-faulty1.fretest:28:8].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'peer' in classifier 'Extra' [file: test-faulty1.fretest:32:18].")).toBeTruthy();
                }
            }
        }
    });
});
