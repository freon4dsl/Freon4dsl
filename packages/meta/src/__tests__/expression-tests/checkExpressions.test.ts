import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { LanguageExpressionParser } from "../../languagedef/parser/LanguageExpressionParser";
import { FreInstance, FreLangFunctionCallExp, FreLangSelfExp, FreLanguage, FreLimitedConcept } from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";

describe("Checking expression on referredElement", () => {
    const testdir = "src/__tests__/expression-tests/expressionDefFiles/";
    let language: FreLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("referredElement of simple expressions on AA", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on AA
            // tslint:disable-next-line:variable-name
            const AAconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "AA");
            // set of expressions should refer to some concept or interface in the language
            expect(AAconceptExps).not.toBeNull();
            const aaConcept = AAconceptExps.conceptRef?.referred;
            expect(aaConcept).not.toBeNull();
            // for each expression in the set, it should refer to a property of 'AA'
            AAconceptExps.exps.forEach(exp => {
                expect(exp.$referredElement.referred === aaConcept);
                const prop = exp.appliedfeature?.$referredElement?.referred;
                expect(prop).not.toBeNull();
                expect(aaConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of simple expressions on BB", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on BB
            // tslint:disable-next-line:variable-name
            const BBconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "BB");
            // set of expressions should refer to some concept or interface in the language
            expect(BBconceptExps).not.toBeNull();
            expect(BBconceptExps).not.toBeUndefined();
            const bbConcept = BBconceptExps.conceptRef?.referred;
            expect(bbConcept).not.toBeNull();
            expect(bbConcept).not.toBeUndefined();
            // for each expression in the set, it should refer to a property of 'BB'
            BBconceptExps.exps.forEach(exp => {
                expect(exp.$referredElement.referred === bbConcept);
                const prop = exp.appliedfeature?.$referredElement?.referred;
                expect(prop).not.toBeNull();
                expect(prop).not.toBeUndefined();
                expect(bbConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of limited concept expressions in CC", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on CC
            // tslint:disable-next-line:variable-name
            const CCconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "CC");
            // set of expressions should refer to some concept or interface in the language
            expect(CCconceptExps).not.toBeNull();
            expect(CCconceptExps).not.toBeUndefined();
            const zzConcept = language.findConcept("ZZ");
            expect(zzConcept).not.toBeNull();
            expect(zzConcept).not.toBeUndefined();
            expect(zzConcept instanceof FreLimitedConcept);
            // for each expression in the set, it should refer to an predefined instance of 'ZZ'
            CCconceptExps.exps.forEach(exp => {
                expect(exp.$referredElement?.referred === zzConcept);
                const freInstance = exp.$referredElement.referred;
                expect(freInstance).not.toBeNull();
                expect(freInstance instanceof FreInstance);
                expect((zzConcept as FreLimitedConcept).instances.includes(freInstance as FreInstance));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of other kinds of expressions in DD", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on DD
            // tslint:disable-next-line:variable-name
            const DDconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "DD");
            expect(DDconceptExps).not.toBeNull();
            expect(DDconceptExps).not.toBeUndefined();
            // for each expression in the set, it should refer to a function
            DDconceptExps.exps.forEach(exp => {
                expect(exp instanceof FreLangFunctionCallExp);
                expect(exp.$referredElement).toBeUndefined();
                expect((exp as FreLangFunctionCallExp).actualparams.length > 0 );
                // every actual parameter should refer to a property, a predefined instance, or to 'owner'
                (exp as FreLangFunctionCallExp).actualparams.forEach(param => {
                    if (param.sourceName !== "container") {
                        expect(param.$referredElement?.referred).not.toBeNull();
                        expect(param.$referredElement?.referred).not.toBeUndefined();
                    }
                });
            });
        } else {
            console.log("Language not present");
        }
    });

    test("applied feature in FF", () => {
        const expressionFile = testdir + "test1.fretest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on FF
            // tslint:disable-next-line:variable-name
            const FFconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "FF");
            expect(FFconceptExps).not.toBeNull();
            const ffConcept = FFconceptExps.conceptRef?.referred;
            expect(ffConcept).not.toBeNull();
            // the only expression in the set is an appliedFeature
            // its reference should be set correctly
            const aaConcept = language.findConcept("AA");
            FFconceptExps.exps.forEach(exp => {
                expect(exp instanceof FreLangSelfExp);
                expect(exp.$referredElement.referred === ffConcept);
                const elem = exp.findRefOfLastAppliedFeature();
                expect(elem).not.toBeNull();
                expect(elem).not.toBeUndefined();
                expect(elem.name === "aa");
                expect(elem.type === aaConcept);
            });
        } else {
            console.log("Language not present");
        }
    });
});
