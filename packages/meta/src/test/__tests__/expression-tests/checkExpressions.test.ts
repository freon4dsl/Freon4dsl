import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { LanguageExpressionParser } from "../../../languagedef/parser/LanguageExpressionParser";
import { PiInstance, PiLangFunctionCallExp, PiLangSelfExp, PiLanguageUnit, PiLimitedConcept } from "../../../languagedef/metalanguage";

describe("Checking expression on referredElement", () => {
    let testdir = "src/test/__tests__/expression-tests/expressionDefFiles/";
    let language: PiLanguageUnit;

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "testLanguage.lang");
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("referredElement of simple expressions on AA", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on AA
            let AAconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "AA");
            // set of expressions should refer to some concept or interface in the language
            expect(AAconceptExps).not.toBeNull();
            let aaConcept = AAconceptExps.conceptRef?.referred;
            expect(aaConcept).not.toBeNull();
            // for each expression in the set, it should refer to a property of 'AA'
            AAconceptExps.exps.forEach(exp => {
                expect(exp.referredElement.referred === aaConcept);
                let prop = exp.appliedfeature?.referredElement?.referred;
                expect(prop).not.toBeNull();
                expect(aaConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of simple expressions on BB", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on BB
            let BBconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "BB");
            // set of expressions should refer to some concept or interface in the language
            expect(BBconceptExps).not.toBeNull();
            expect(BBconceptExps).not.toBeUndefined();
            let bbConcept = BBconceptExps.conceptRef?.referred;
            expect(bbConcept).not.toBeNull();
            expect(bbConcept).not.toBeUndefined();
            // for each expression in the set, it should refer to a property of 'BB'
            BBconceptExps.exps.forEach(exp => {
                expect(exp.referredElement.referred === bbConcept);
                let prop = exp.appliedfeature?.referredElement?.referred;
                expect(prop).not.toBeNull();
                expect(prop).not.toBeUndefined();
                expect(bbConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of limited concept expressions in CC", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on CC
            let CCconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "CC");
            // set of expressions should refer to some concept or interface in the language
            expect(CCconceptExps).not.toBeNull();
            expect(CCconceptExps).not.toBeUndefined();
            let zzConcept = language.findConcept("ZZ");
            expect(zzConcept).not.toBeNull();
            expect(zzConcept).not.toBeUndefined();
            expect(zzConcept instanceof PiLimitedConcept);
            // for each expression in the set, it should refer to an predefined instance of 'ZZ'
            CCconceptExps.exps.forEach(exp => {
                expect(exp.referredElement?.referred === zzConcept);
                let piInstance = exp.referredElement.referred;
                expect(piInstance).not.toBeNull();
                expect(piInstance instanceof PiInstance);
                expect((zzConcept as PiLimitedConcept).instances.includes(piInstance as PiInstance));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referredElement of other kinds of expressions in DD", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on DD
            let DDconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "DD");
            expect(DDconceptExps).not.toBeNull();
            expect(DDconceptExps).not.toBeUndefined();
            // for each expression in the set, it should refer to a function
            DDconceptExps.exps.forEach(exp => {
                expect(exp instanceof PiLangFunctionCallExp);
                expect(exp.referredElement).toBeUndefined();
                expect((exp as PiLangFunctionCallExp).actualparams.length > 0 );
                // every actual parameter should refer to a property, a predefined instance, or to 'container'
                (exp as PiLangFunctionCallExp).actualparams.forEach(param => {
                    if (param.sourceName !== "container") {
                        expect(param.referredElement?.referred).not.toBeNull();
                        expect(param.referredElement?.referred).not.toBeUndefined();
                    }
                });
            });
        } else {
            console.log("Language not present");
        }
    });

    test("applied feature in FF", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on FF
            let FFconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "FF");
            expect(FFconceptExps).not.toBeNull();
            let ffConcept = FFconceptExps.conceptRef?.referred;
            expect(ffConcept).not.toBeNull();
            // the only expression in the set is an appliedFeature
            // its reference should be set correctly
            let aaConcept = language.findConcept("AA");
            FFconceptExps.exps.forEach(exp => {
                expect(exp instanceof PiLangSelfExp);
                expect(exp.referredElement.referred === ffConcept);
                let elem = exp.findRefOfLastAppliedFeature();
                expect(elem).not.toBeNull();
                expect(elem).not.toBeUndefined();
                expect(elem.name === "aa");
                expect(elem.type?.referred === aaConcept);
            });
        } else {
            console.log("Language not present");
        }
    });
});
