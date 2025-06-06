import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage, FreMetaLimitedConcept } from '../../languagedef/metalanguage';

import { LanguageExpressionTesterNew } from "../../langexpressions/parser/LanguageExpressionTesterNew.js";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew.js";

import { describe, test, expect, beforeEach } from "vitest";
import { MetaLogger } from '../../utils';
import {
    FreFunctionExp, FreLimitedInstanceExp,
    FreVarExp,
    FreVarOrFunctionExp
} from '../../langexpressions/metalanguage';

describe("Checking expression on referredProperty", () => {
    const testdir = "src/__tests__/new-expression-tests/expressionDefFiles/";
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
    });

    test("referredProperty of simple expressions on AA", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest: LanguageExpressionTesterNew | undefined = new LanguageExpressionParserNew(language).parse(
                expressionFile
            );
            expect(readTest).not.toBeNull();
            expect(readTest).not.toBeUndefined();
            // check expressions on AA

            const AAconceptExps = readTest!.conceptExps.find((ce) => ce.classifierRef.name === "AA");
            // set of expressions should refer to some concept or interface in the language
            expect(AAconceptExps).not.toBeNull();
            expect(AAconceptExps).not.toBeUndefined();
            const aaConcept = AAconceptExps!.classifierRef?.referred;
            expect(aaConcept).not.toBeNull();
            // for each expression in the set, it should refer to a property of 'AA'
            AAconceptExps!.exps.forEach((exp) => {
                const last = exp.getLastExpression();
                if (last instanceof FreVarOrFunctionExp) {
                    expect(last.referredClassifier === aaConcept);
                    const prop = last.referredProperty;
                    expect(prop).not.toBeNull();
                    expect(aaConcept.allProperties().includes(prop));
                } else {
                    console.log("Error");
                }
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredProperty of simple expressions on BB", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest: LanguageExpressionTesterNew | undefined = new LanguageExpressionParserNew(language).parse(
                expressionFile,
            );
            expect(readTest).not.toBeNull();
            expect(readTest).not.toBeUndefined();
            // check expressions on BB
            const BBconceptExps = readTest!.conceptExps.find((ce) => ce.classifierRef.name === "BB");
            // set of expressions should refer to some concept or interface in the language
            expect(BBconceptExps).not.toBeNull();
            expect(BBconceptExps).not.toBeUndefined();
            const bbConcept = BBconceptExps!.classifierRef?.referred;
            expect(bbConcept).not.toBeNull();
            expect(bbConcept).not.toBeUndefined();
            // for each expression in the set, it should refer to a property of 'BB'
            BBconceptExps!.exps.forEach((exp) => {
                const last = exp.getLastExpression();
                if (last instanceof FreVarOrFunctionExp) {
                    expect(last.referredClassifier === bbConcept);
                    const prop = last.referredProperty;
                    expect(prop).not.toBeNull();
                    expect(prop).not.toBeUndefined();
                    expect(bbConcept.allProperties().includes(prop));
                } else {
                    console.log("Error");
                }
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredProperty of limited concept expressions in CC", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest: LanguageExpressionTesterNew | undefined = new LanguageExpressionParserNew(language).parse(
                expressionFile,
            );
            expect(readTest).not.toBeNull();
            expect(readTest).not.toBeUndefined();
            // check expressions on CC
            // tslint:disable-next-line:variable-name
            const CCconceptExps = readTest!.conceptExps.find((ce) => ce.classifierRef.name === "CC");
            // set of expressions should refer to some concept or interface in the language
            expect(CCconceptExps).not.toBeNull();
            expect(CCconceptExps).not.toBeUndefined();
            const zzConcept = language.findConcept("ZZ");
            expect(zzConcept).not.toBeNull();
            expect(zzConcept).not.toBeUndefined();
            expect(zzConcept instanceof FreMetaLimitedConcept);
            // for each expression in the set, it should refer to a predefined instance of 'ZZ'
            CCconceptExps!.exps.forEach((exp) => {
                const last = exp.getLastExpression();
                if (last instanceof FreLimitedInstanceExp) {
                    expect(last.referredClassifier === zzConcept);
                    const freInstance = last.referredInstance;
                    expect(freInstance).not.toBeNull();
                    expect((zzConcept as FreMetaLimitedConcept).instances.includes(freInstance));
                } else {
                    console.log("Error: ", exp.constructor.name);
                }
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredProperty of other kinds of expressions in DD", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest: LanguageExpressionTesterNew | undefined = new LanguageExpressionParserNew(language).parse(
                expressionFile,
            );
            expect(readTest).not.toBeNull();
            expect(readTest).not.toBeUndefined();
            // check expressions on DD
            const DDconceptExps = readTest!.conceptExps.find((ce) => ce.classifierRef.name === "DD");
            expect(DDconceptExps).not.toBeNull();
            expect(DDconceptExps).not.toBeUndefined();
            const ddConcept = DDconceptExps!.classifierRef?.referred;
            expect(ddConcept).not.toBeNull();
            expect(ddConcept).not.toBeUndefined();
            DDconceptExps!.exps.forEach((exp) => {
                const last = exp.getLastExpression();
                // for each expression in the set, it should refer to a function
                expect(last instanceof FreFunctionExp);
                // for each expression in the set, the resulting classifier is unknown
                // ('type()' leaves an undefined result)
                expect(last.getResultingClassifier()).toBeUndefined();
            });
        } else {
            console.log("Language not present");
        }
    });

    test("applied feature in FF", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest: LanguageExpressionTesterNew | undefined = new LanguageExpressionParserNew(language).parse(
                expressionFile,
            );
            expect(readTest).not.toBeNull();
            expect(readTest).not.toBeUndefined();
            // check expressions on FF
            const FFconceptExps = readTest!.conceptExps.find((ce) => ce.classifierRef.name === "FF");
            expect(FFconceptExps).not.toBeNull();
            expect(FFconceptExps).not.toBeUndefined();
            const ffConcept = FFconceptExps!.classifierRef?.referred;
            expect(ffConcept).not.toBeNull();
            // the only expression in the set is an applied feature
            // its reference should be set correctly, as well as all references in between
            const aaConcept = language.findConcept("AA");
            FFconceptExps!.exps.forEach((exp) => {
                // the first is 'self', handle this differently
                expect(exp instanceof FreVarExp);
                expect((exp as FreVarExp).referredClassifier === ffConcept);
                // check all expressions in the series
                let nextExp = (exp as FreVarExp).applied.exp;
                while (!!nextExp) {
                    console.log('checking: ', nextExp.toErrorString(), nextExp.toFreString())
                    expect(nextExp instanceof FreVarExp);
                    expect((nextExp as FreVarExp).referredProperty).not.toBeNull();
                    expect((nextExp as FreVarExp).referredProperty).not.toBeUndefined();
                    nextExp = nextExp.applied?.exp;
                }
                const last = exp.getLastExpression();
                expect(last instanceof FreVarExp);
                const elem = (last as FreVarExp).referredProperty;
                expect(elem).not.toBeNull();
                expect(elem).not.toBeUndefined();
                expect(elem!.name === "aa");
                expect(elem!.type === aaConcept);
            });
        } else {
            console.log("Language not present");
        }
    });
});
