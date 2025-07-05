import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage/';
import { describe, test, expect, beforeEach } from "vitest";
import { MetaLogger } from '../../utils/no-dependencies/';
import { Checker } from '../../utils/basic-dependencies/';
import { ValidatorParser } from '../../validatordef/parser/ValidatorParser';
import { ValidatorDef } from '../../validatordef/metalanguage/';

describe("Checking the validator checker", () => {
    const testdir = "src/__tests__/validator-tests/validatorDefFiles/";
    let parser: ValidatorParser;
    let checker: Checker<ValidatorDef>;
    let language: FreMetaLanguage | undefined;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        parser = new ValidatorParser(language);
        checker = parser.checker;
    });

    test("error messsage should be given", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.valid");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    // console.log(e.message + e.stack);
                    // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                    // console.log(checker.warnings.map(err => `"${err}"`).join("\n"));
                    expect(e.message).toBe(`checking errors (10).`);
                    expect(checker.errors.includes("Type of 'self.AAprop1' does not conform to 'number' [file: test-faulty1.valid:5:5].")).toBeTruthy();
                    expect(checker.errors.includes("Type of 'self.AAprop5' does not conform to 'number' [file: test-faulty1.valid:8:5].")).toBeTruthy();
                    expect(checker.errors.includes("IsUnique rule cannot be applied to a property that is not a list (AAprop7) [file: test-faulty1.valid:11:8].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'wrong' in classifier 'BB' [file: test-faulty1.valid:14:35].")).toBeTruthy();
                    expect(checker.errors.includes("NotEmpty rule 'self.AAprop9' should refer to a list [file: test-faulty1.valid:18:5].")).toBeTruthy();
                    expect(checker.errors.includes("IsUnique rule cannot be applied to a property that is not a list (AAprop11) [file: test-faulty1.valid:21:8].")).toBeTruthy();
                    expect(checker.errors.includes("Valid name rule expression 'self.AAprop1' should have type 'identifier' [file: test-faulty1.valid:28:21].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'left' in classifier 'DD' [file: test-faulty1.valid:34:32].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'right' in classifier 'DD' [file: test-faulty1.valid:34:43].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find classifier 'UNKNOWN' [file: test-faulty1.valid:38:1].")).toBeTruthy();
                    expect(checker.warnings.includes("Note that 'self' refers to list elements, i.e. instances of BB [file: test-faulty1.valid:14:8].")).toBeTruthy();
                    expect(checker.warnings.includes("Note that 'self' refers to list elements, i.e. instances of DD [file: test-faulty1.valid:23:8].")).toBeTruthy();
                }
            }
        }
    });

    test(".valid file should be parsed without errors", () => {
        let validatorDef: ValidatorDef
        if (!!language) {
            try {
                validatorDef = parser.parse(testdir + "test-correct1.valid");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (0).`);
                }
            }
        }
        expect(validatorDef).not.toBeUndefined();
        expect(validatorDef).not.toBeNull();

        // check rule sets
        const classAA = language.findClassifier('AAAAAA')
        const classDD = language.findClassifier('DD')
        const ruleSetAA = validatorDef.classifierRules.find(rs => rs.classifier === classAA)
        expect(ruleSetAA).not.toBeNull;
        expect(ruleSetAA).not.toBeUndefined;
        expect(ruleSetAA.rules.length).toBe(6);

        const ruleSetDD = validatorDef.classifierRules.find(rs => rs.classifier === classDD)
        expect(ruleSetDD).not.toBeNull;
        expect(ruleSetDD).not.toBeUndefined;
        expect(ruleSetDD.rules.length).toBe(2);
    });
});
