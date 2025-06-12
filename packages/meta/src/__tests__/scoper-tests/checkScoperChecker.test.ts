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
                    expect(e.message).toBe(`checking errors (20).`);
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
                    expect(checker.errors.includes("Parent scope definition (FF) does not comply with scope definition for EE [file: testLanguage.ast:120:1].")).toBeTruthy();
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
        const classAA = language.findClassifier('AA')
        const classBB = language.findClassifier('BB')
        const classDD = language.findClassifier('DD')
        const classEE = language.findClassifier('EE')
        const classFF = language.findClassifier('FF')
        expect(scopeDef.namespaces.includes(classAA)).toBeTruthy();
        expect(scopeDef.namespaces.includes(classBB)).toBeTruthy();
        expect(scopeDef.namespaces.includes(classDD)).toBeTruthy();
        expect(scopeDef.namespaces.includes(classEE)).toBeTruthy();
        expect(scopeDef.namespaces.includes(classFF)).toBeTruthy();

        // check imports on AA
        const defAA = scopeDef.scopeConceptDefs.find(cd => cd.classifier === classAA);
        expect(defAA.namespaceReplacement).toBeUndefined();
        // console.log(defAA.namespaceAddition.nsInfoList.map(xx => xx.expression.toFreString()).join('\n'));
        expect(defAA.namespaceAddition.nsInfoList.length).toBe(6);

        // check imports on BB
        const defBB = scopeDef.scopeConceptDefs.find(cd => cd.classifier === classBB);
        expect(defBB.namespaceReplacement).toBeUndefined();
        // console.log(defBB.namespaceAddition.nsInfoList.map(xx => xx.expression.toFreString()).join('\n'));
        expect(defBB.namespaceAddition.nsInfoList.length).toBe(3);

        // check imports on DD
        const defDD = scopeDef.scopeConceptDefs.find(cd => cd.classifier === classDD);
        expect(defDD.namespaceReplacement).toBeUndefined();
        console.log(defDD.namespaceAddition.nsInfoList.map(xx => xx.expression.toFreString()).join('\n'));
        expect(defDD.namespaceAddition.nsInfoList.length).toBe(2);

        // check alternatives on FF
        const defFF = scopeDef.scopeConceptDefs.find(cd => cd.classifier === classFF);
        expect(defFF.namespaceAddition).toBeUndefined();
        // console.log(defFF.namespaceReplacement.nsInfoList.map(xx => xx.expression.toFreString()).join('\n'));
        expect(defFF.namespaceReplacement.nsInfoList.length).toBe(1);

        // check alternatives on EE
        const defEE = scopeDef.scopeConceptDefs.find(cd => cd.classifier === classEE);
        expect(defEE.namespaceAddition).toBeUndefined();
        // console.log(defEE.namespaceReplacement.nsInfoList.map(xx => xx.expression.toFreString()).join('\n'));
        expect(defEE.namespaceReplacement.nsInfoList.length).toBe(2);
    });
});
