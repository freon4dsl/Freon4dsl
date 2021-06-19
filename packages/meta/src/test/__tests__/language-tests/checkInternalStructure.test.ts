import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { PiExpressionConcept, PiLanguage, PiLimitedConcept, PiPrimitiveProperty } from "../../../languagedef/metalanguage";
import { LangUtil } from "../../../utils";

// The tests in this file determine whether the internal structure of a language definition is correct.

describe("Checking internal structure of language", () => {
    const parser = new LanguageParser();
    const testdir = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/";

    // TODO implement the following tests:

    // on PiLanguage
    // ??? predefined (primitive types)
    test("internal structure of PiLanguage", () => {
        const parseFile = testdir + "test2.ast";
        let piLanguage: PiLanguage;
        try {
            piLanguage = parser.parse(parseFile);
        } catch (e) {
            // this would be a true error
            console.log(e.message);
        }
        expect(piLanguage).not.toBeUndefined();
        // there is a root concept
        expect(piLanguage.modelConcept).not.toBeNull();
        // there is a single expression base or none at all
        const result = piLanguage.concepts.filter(c => {
            return c instanceof PiExpressionConcept && (!!c.base ? !(c.base.referred instanceof PiExpressionConcept) : true);
        });
        expect(result.length).toBeLessThan(2);
        // if there is a classifier, we can find it
        piLanguage.concepts.forEach(classifier => {
            expect(piLanguage.findClassifier(classifier.name)).not.toBeNull();
            expect(piLanguage.findConcept(classifier.name)).not.toBeNull();
            expect(piLanguage.findInterface(classifier.name)).toBeUndefined();
        });
        piLanguage.interfaces.forEach(classifier => {
            expect(piLanguage.findClassifier(classifier.name)).not.toBeNull();
            expect(piLanguage.findConcept(classifier.name)).toBeUndefined();
            expect(piLanguage.findInterface(classifier.name)).not.toBeNull();
        });
    });

    // on PiConcept and PiInterface
    // TODO if an implemented interface has a prop, we can find it
    test("internal structure of PiConcept and PiInterface: properties", () => {
        const parseFile = testdir + "test2.ast";
        let piLanguage: PiLanguage;
        try {
            piLanguage = parser.parse(parseFile);
        } catch (e) {
            // this would be a true error
            console.log(e.message);
            console.log(e.stack);
        }
        expect(piLanguage).not.toBeUndefined();
        // no references in the parts list, and vice versa
        // no primProps in reference list
        const piConcept = piLanguage.findConcept("BB");
        piConcept.parts().forEach(part => {
            expect(part.isPart).toBe(true);
        });
        piConcept.references().forEach(part => {
            expect(part.isPart).toBe(false);
            // TODO Stoppeed working with es6: fixit
            // expect(part).not.toBeInstanceOf(PiPrimitiveProperty);
        });
        piConcept.primProperties.forEach(part => {
            expect(part.isPart).toBe(true);
        });
    });

    test("internal structure of PiConcept and PiInterface: inheritance", () => {
        const parseFile = testdir + "test3.ast";
        let piLanguage: PiLanguage;
        try {
            piLanguage = parser.parse(parseFile);
        } catch (e) {
            // this would be a true error
            console.log(e.message);
        }

        expect(piLanguage).not.toBeUndefined();

        // no references in the parts list, and vice versa
        // no primProps in reference list
        const piConcept = piLanguage.findConcept("BB");
        expect(piConcept.allParts().length).toBeGreaterThan(0);
        piConcept.allParts().forEach(part => {
            expect(part.isPart).toBe(true);
        });
        piConcept.allReferences().forEach(part => {
            expect(part.isPart).toBe(false);
            // TODO Es6 problem
            // expect(part).not.toBeInstanceOf(PiPrimitiveProperty);
        });
        piConcept.allPrimProperties().forEach(part => {
            expect(part.isPart).toBe(true);
        });

        // if a 'base' has a prop, we can find it
        const baseConcept = piConcept.base.referred.base.referred;     // should be "BaseBaseBB"
        expect(baseConcept).not.toBeUndefined();
        baseConcept.allProperties().forEach(prop => {
            expect(piConcept.allProperties()).toContain(prop);
        });

        // we can find all subconcepts, also recursive
        let list = LangUtil.subConcepts(baseConcept);
        expect(list).toContain(piLanguage.findConcept("BaseBB"));
        expect(list).toContain(piLanguage.findConcept("DD"));
        expect(list).not.toContain(piLanguage.findConcept("Model"));
        expect(list).not.toContain(piLanguage.findConcept("AA"));
        expect(list).toContain(piLanguage.findConcept("BB"));
        expect(list).toContain(piLanguage.findConcept("CC"));
        expect(list).not.toContain(piLanguage.findConcept("BaseBaseBB"));

        // we can find all superconcepts, also recursive
        list = LangUtil.superConcepts(piConcept);
        expect(list).toContain(piLanguage.findConcept("BaseBB"));
        expect(list).not.toContain(piLanguage.findConcept("DD"));
        expect(list).not.toContain(piLanguage.findConcept("Model"));
        expect(list).not.toContain(piLanguage.findConcept("AA"));
        expect(list).not.toContain(piLanguage.findConcept("BB"));
        expect(list).not.toContain(piLanguage.findConcept("CC"));
        expect(list).toContain(piLanguage.findConcept("BaseBaseBB"));
        // TODO we can find all subinterfaces, also recursive
        // TODO we can find all superinterfaces, also recursive
    });

    // on PiProperty
    // test optional, list, part properties
    // test properties with limited concept as type
    // test isStatic prim properties
    // test initial value of properties

    // on PiInstance
    test("internal structure of PiInstance", () => {
        const parseFile = testdir + "test4.ast";
        let piLanguage: PiLanguage;
        try {
            piLanguage = parser.parse(parseFile);
        } catch (e) {
            // this would be a true error
            console.log(e.message);
        }
        expect(piLanguage).not.toBeUndefined();
        const list = piLanguage.concepts.filter(con => con instanceof PiLimitedConcept);
        // PiInstance.concept should be a limited property
        // let myLimited = piLanguage.findConcept("BB");
        list.forEach(myLimited => {
            // TODO Es6 problem
            // expect(myLimited).toBeInstanceOf(PiLimitedConcept);
            // test PiInstance against its concept
            (myLimited as PiLimitedConcept).instances.forEach(inst => {
                expect(inst.concept.referred).toBe(myLimited);
                inst.props.forEach(instProp => {
                    expect(myLimited.allProperties()).toContain(instProp.property.referred);
                });
            });
        });
    });
});
