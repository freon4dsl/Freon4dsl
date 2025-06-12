import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaClassifier, FreMetaLanguage } from '../../languagedef/metalanguage';
import { describe, test, expect, beforeEach } from "vitest";
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { Checker } from '../../utils/basic-dependencies/index.js';
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

    test("error messsage should be given", () => {
        if (!!language) {
            try {
                parser.parse(testdir + "test-faulty1.scope");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    // console.log(e.message + e.stack);
                    // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                    expect(e.message).toBe(`checking errors (19).`);
                    expect(checker.errors.includes("Cannot find property 'ff' in classifier 'BB' [file: test-faulty1.scope:28:9].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find property 'ff' in classifier 'EE' [file: test-faulty1.scope:38:9].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot find classifier 'cc' [file: test-faulty1.scope:5:15].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'string') [file: test-faulty1.scope:10:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'number') [file: test-faulty1.scope:11:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'boolean') [file: test-faulty1.scope:12:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'CC') [file: test-faulty1.scope:16:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'CC') [file: test-faulty1.scope:17:5].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'undefined') [file: test-faulty1.scope:28:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'ZZ') [file: test-faulty1.scope:29:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'ZZ') [file: test-faulty1.scope:30:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'ZZ') [file: test-faulty1.scope:31:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'ZZ') [file: test-faulty1.scope:32:9].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'undefined') [file: test-faulty1.scope:38:9].")).toBeTruthy();
                    expect(checker.errors.includes("Double entry (BB) is not allowed [file: test-faulty1.scope:43:1].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot change namespace CC, because it is not defined as namespace [file: test-faulty1.scope:50:6].")).toBeTruthy();
                    expect(checker.errors.includes("A namespace expression should refer to a namespace (found: 'ZZ') [file: test-faulty1.scope:59:9].")).toBeTruthy();
                    expect(checker.errors.includes("Double entry (EE) is not allowed [file: test-faulty1.scope:63:1].")).toBeTruthy();
                    expect(checker.errors.includes("Cannot change namespace ExtraProp, because it is not defined as namespace [file: test-faulty1.scope:76:5].")).toBeTruthy();
                }
            }
        }
    });

    test("Scope file should be parsed without errors", () => {
        let scopeDef: ScopeDef
        if (!!language) {
            try {
                scopeDef = parser.parse(testdir + "test-correct1.scope");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    expect(e.message).toBe(`checking errors (0).`);
                }
            }
        }
        expect(scopeDef).not.toBeUndefined();
        expect(scopeDef).not.toBeNull();

        // check namespaces
        const nsAA = language.findClassifier('AA')
        const nsDD = language.findClassifier('DD')
        const nsEE = language.findClassifier('EE')
        const nsFF = language.findClassifier('FF')
        expect(scopeDef.namespaces.includes(nsAA)).toBeTruthy();
        expect(scopeDef.namespaces.includes(nsDD)).toBeTruthy();
        expect(scopeDef.namespaces.includes(nsEE)).toBeTruthy();
        expect(scopeDef.namespaces.includes(nsFF)).toBeTruthy();

        // check imports on AA
        const defAA = scopeDef.scopeConceptDefs.find(cd => cd.classifier === nsAA);
        expect(defAA.namespaceReplacement).toBeUndefined();
        expect(defAA.namespaceAddition.expressions.length).toBe(6);

        // check alternatives on EE
        const defEE = scopeDef.scopeConceptDefs.find(cd => cd.classifier === nsEE);
        expect(defEE.namespaceAddition).toBeUndefined();
        expect(defEE.namespaceReplacement.expressions.length).toBe(1);
    });
});
