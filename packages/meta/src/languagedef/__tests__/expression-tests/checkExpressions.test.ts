import { LanguageParser } from "../../parser/LanguageParser";
import { LanguageExpressionParser } from "../../parser/LanguageExpressionParser";
import { PiInstance, PiLanguageUnit, PiLimitedConcept } from "../../metalanguage";

describe("Checking expression on referedElement", () => {
    let testdir = "src/languagedef/__tests__/expression-tests/expressionDefFiles/";
    let language: PiLanguageUnit;

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/languagedef/__tests__/expression-tests/expressionDefFiles/testLanguage.lang");
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("referedElement of simple expressions on AA", () => {
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
                expect(exp.referedElement.referred === aaConcept);
                let prop = exp.appliedfeature?.referedElement?.referred;
                expect(prop).not.toBeNull();
                expect(aaConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referedElement of simple expressions on BB", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on BB
            let BBconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "BB");
            // set of expressions should refer to some concept or interface in the language
            expect(BBconceptExps).not.toBeNull();
            let bbConcept = BBconceptExps.conceptRef?.referred;
            expect(bbConcept).not.toBeNull();
            // for each expression in the set, it should refer to a property of 'BB'
            BBconceptExps.exps.forEach(exp => {
                expect(exp.referedElement.referred === bbConcept);
                let prop = exp.appliedfeature?.referedElement?.referred;
                expect(prop).not.toBeNull();
                expect(bbConcept.allProperties().includes(prop));
            });
        } else {
            console.log("Language not present");
        }
    });

    test("referedElement of limited concept expressions in CC", () => {
        let expressionFile = testdir + "test1.pitest";
        if (!!language) {
            const readTest = new LanguageExpressionParser(language).parse(expressionFile);
            // check expressions on CC
            let CCconceptExps = readTest.conceptExps.find(ce => ce.conceptRef.name === "CC");
            // set of expressions should refer to some concept or interface in the language
            expect(CCconceptExps).not.toBeNull();
            let zzConcept = language.findConcept("ZZ");
            expect(zzConcept).not.toBeNull();
            expect(zzConcept instanceof PiLimitedConcept);
            // for each expression in the set, it should refer to an predefined instance of 'ZZ'
            CCconceptExps.exps.forEach(exp => {
                expect(exp.referedElement?.referred === zzConcept);
                let piInstance = exp.referedElement.referred;
                expect(piInstance).not.toBeNull();
                expect(piInstance instanceof PiInstance);
                expect((zzConcept as PiLimitedConcept).instances.includes(piInstance as PiInstance));
            });
        } else {
            console.log("Language not present");
        }
    });

});
