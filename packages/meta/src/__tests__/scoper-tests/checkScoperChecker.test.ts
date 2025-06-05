import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage';
import { describe, test, expect, beforeEach } from "vitest";
import { Checker, MetaLogger } from '../../utils';
import { ScoperParser } from '../../scoperdef/parser/ScoperParser';
import { ScopeDef } from '../../scoperdef/metalanguage';

describe("Checking the scoper checker", () => {
    const testdir = "src/__tests__/scoper-tests/scopeDefFiles/";
    let parser: ScoperParser;
    let checker: Checker<ScopeDef>;
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
        parser = new ScoperParser(language);
        checker = parser.checker;
    });

    test("Error messages should be given", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.scope");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (14).`);
                    expect(checker.errors.includes("Reference to classifier 'cc' cannot be resolved [file: test-faulty1.scope:5:15].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'string') [file: test-faulty1.scope:10:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'number') [file: test-faulty1.scope:11:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'boolean') [file: test-faulty1.scope:12:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'CC') [file: test-faulty1.scope:16:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'CC') [file: test-faulty1.scope:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'undefined') [file: test-faulty1.scope:28:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'undefined') [file: test-faulty1.scope:34:9].")).toBeTruthy();
                    expect(checker.errors.includes("Double entry (BB) is not allowed [file: test-faulty1.scope:39:1].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot change namespace CC, because it is not defined as namespace [file: test-faulty1.scope:49:6].")).toBeTruthy();
                    expect(checker.errors.includes("Double entry (EE) is not allowed [file: test-faulty1.scope:61:1].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot change namespace ExtraProp, because it is not defined as namespace [file: test-faulty1.scope:74:5].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property or classifier 'ff' in 'BB' [file: test-faulty1.scope:28:9].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property or classifier 'ff' in 'EE' [file: test-faulty1.scope:34:9].")).toBeTruthy();
                }
            }
        }
    });

    test("Scope file should be parsed without errors", () => {
        let xx: ScopeDef
        if (!!language) {
            try {
                xx = parser.parse(testdir + "test-correct1.scope");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (0).`);
                    // expect(checker.errors.includes("Cannot find property 'AAprop14' in 'CC' [file: test-faulty1.fretest:9:18].")).toBeTruthy();
                }
            }
        }
        expect(xx).not.toBeUndefined();
        expect(xx).not.toBeNull();
        // TODO add more extensive expectations
    });
});
