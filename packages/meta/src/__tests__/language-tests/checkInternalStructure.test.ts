import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { FreConcept, FreExpressionConcept, FreLanguage, FreLimitedConcept, FrePrimitiveProperty } from "../../languagedef/metalanguage";
import { LangUtil, MetaLogger } from "../../utils";

// The tests in this file determine whether the internal structure of a language definition is correct.
describe("Checking internal structure of language", () => {
    const parser = new LanguageParser();
    const testdir = "src/__tests__/language-tests/correctDefFiles/internal-structure/";
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    function readAstFile(parseFile: string): FreLanguage {
        let freLanguage: FreLanguage;
        try {
            freLanguage = parser.parse(parseFile);
        } catch (e) {
            // this would be a true error
            console.log(e.message + parser.checker.errors.map(err => err).join("\n") + e.stack );
        }
        return freLanguage;
    }

    // on FretLanguage
    // ??? predefined (primitive types)
    test("internal structure of FretLanguage", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test2.ast");

        expect(freLanguage).not.toBeUndefined();
        // there is a root concept
        expect(freLanguage.modelConcept).not.toBeNull();
        // there is a single expression base or none at all
        const result = freLanguage.concepts.filter(c => {
            return c instanceof FreExpressionConcept && (!!c.base ? !(c.base.referred instanceof FreExpressionConcept) : true);
        });
        expect(result.length).toBeLessThan(2);
        // if there is a classifier, we can find it
        freLanguage.concepts.forEach(classifier => {
            expect(freLanguage.findClassifier(classifier.name)).not.toBeNull();
            expect(freLanguage.findConcept(classifier.name)).not.toBeNull();
            expect(freLanguage.findInterface(classifier.name)).toBeUndefined();
        });
        freLanguage.interfaces.forEach(classifier => {
            expect(freLanguage.findClassifier(classifier.name)).not.toBeNull();
            expect(freLanguage.findConcept(classifier.name)).toBeUndefined();
            expect(freLanguage.findInterface(classifier.name)).not.toBeNull();
        });
    });

    // on FretConcept and FretInterface
    // TODO if an implemented interface has a prop, we can find it
    test("internal structure of FretConcept and FretInterface: properties", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test2.ast");
        expect(freLanguage).not.toBeUndefined();
        // no references in the parts list, and vice versa
        // no primProps in reference list
        const freConcept = freLanguage.findConcept("BB");
        freConcept.parts().forEach(part => {
            expect(part.isPart).toBe(true);
        });
        freConcept.references().forEach(part => {
            expect(part.isPart).toBe(false);
            expect(part).not.toBeInstanceOf(FrePrimitiveProperty);
        });
        freConcept.primProperties.forEach(part => {
            expect(part.isPart).toBe(true);
        });
    });

    test("internal structure of FretConcept and FretInterface: inheritance", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test3.ast");
        expect(freLanguage).not.toBeUndefined();

        // no references in the parts list, and vice versa
        // no primProps in reference list
        const freConcept = freLanguage.findConcept("BB");
        expect(freConcept.allParts().length).toBeGreaterThan(0);
        freConcept.allParts().forEach(part => {
            expect(part.isPart).toBe(true);
        });
        freConcept.allReferences().forEach(ref => {
            expect(ref.isPart).toBe(false);
            expect(ref).not.toBeInstanceOf(FrePrimitiveProperty);
        });
        freConcept.allPrimProperties().forEach(part => {
            expect(part.isPart).toBe(true);
        });

        // if a 'base' has a prop, we can find it
        const baseConcept = freConcept.base.referred.base.referred;     // should be "BaseBaseBB"
        expect(baseConcept).not.toBeUndefined();
        baseConcept.allProperties().forEach(prop => {
            expect(freConcept.allProperties()).toContain(prop);
        });

        // we can find all subconcepts, also recursive
        let list = LangUtil.subConcepts(baseConcept);
        expect(list).toContain(freLanguage.findConcept("BaseBB"));
        expect(list).toContain(freLanguage.findConcept("DD"));
        expect(list).not.toContain(freLanguage.findConcept("Model"));
        expect(list).not.toContain(freLanguage.findConcept("AA"));
        expect(list).toContain(freLanguage.findConcept("BB"));
        expect(list).toContain(freLanguage.findConcept("CC"));
        expect(list).not.toContain(freLanguage.findConcept("BaseBaseBB"));

        // we can find all superconcepts, also recursive
        list = LangUtil.superConcepts(freConcept);
        expect(list).toContain(freLanguage.findConcept("BaseBB"));
        expect(list).not.toContain(freLanguage.findConcept("DD"));
        expect(list).not.toContain(freLanguage.findConcept("Model"));
        expect(list).not.toContain(freLanguage.findConcept("AA"));
        expect(list).not.toContain(freLanguage.findConcept("BB"));
        expect(list).not.toContain(freLanguage.findConcept("CC"));
        expect(list).toContain(freLanguage.findConcept("BaseBaseBB"));
        // TODO we can find all subinterfaces, also recursive
        // TODO we can find all superinterfaces, also recursive
    });

    // on FretInstance
    test("internal structure of FretInstance", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test4.ast");
        expect(freLanguage).not.toBeUndefined();
        const list = freLanguage.concepts.filter(con => con instanceof FreLimitedConcept);
        // FretInstance.concept should be a limited property
        // let myLimited = freLanguage.findConcept("BB");
        list.forEach(myLimited => {
            expect(myLimited).toBeInstanceOf(FreLimitedConcept);
            // test FretInstance against its concept
            (myLimited as FreLimitedConcept).instances.forEach(inst => {
                expect(inst.concept.referred).toBe(myLimited);
                inst.props.forEach(instProp => {
                    expect(myLimited.allProperties()).toContain(instProp.property.referred);
                });
            });
        });
    });

    // TODO implement the following tests:
    // on FretProperty
    // test optional, list, part properties
    // test properties with limited concept as type
    // test isStatic prim properties

    // test initial value of properties
    test("initial values of primitive properties", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test5.ast");
        expect(freLanguage).not.toBeUndefined();
        const BB: FreConcept = freLanguage.concepts.find(con => con.name === "BB");
        expect(BB).not.toBeNull();
        BB.allPrimProperties().forEach(prim => {
            switch (prim.name) {
                case "BBprop1": {
                    expect(prim.initialValue).toBe("prop1Value");
                    expect(prim.initialValueList.length).toBe(1);
                    break;
                }
                case "BBprop2": {
                    expect(prim.initialValueList).toStrictEqual(["prop2Index1", "prop2Index2", "prop2Index3"]);
                    break;
                }
                case "BBprop3": {
                    expect(prim.initialValue).toBe(24);
                    expect(prim.initialValueList.length).toBe(1);
                    break;
                }
                case "BBprop4": {
                    expect(prim.initialValueList).toStrictEqual([2, 24, 61, 11, 6, 58]);
                    break;
                }
                case "BBprop5": {
                    expect(prim.initialValue).toBe(true);
                    expect(prim.initialValueList.length).toBe(1);
                    break;
                }
                case "BBprop6": {
                    expect(prim.initialValueList).toStrictEqual([true, false, true, false, false]);
                    break;
                }
                case "BBprop7": {
                    expect(prim.initialValue).toBe("myName");
                    expect(prim.initialValueList.length).toBe(1);
                    break;
                }
                case "BBprop8": {
                    expect(prim.initialValueList).toStrictEqual(["prop8Name1", "prop8Name2", "prop8Name3"]);
                    break;
                }
            }
        });
    });

    test("all kinds of limited concepts", () => {
        const freLanguage: FreLanguage = readAstFile(testdir + "test6.ast");
        expect(freLanguage).not.toBeUndefined();
        const CC: FreConcept = freLanguage.concepts.find(con => con.name === "CC");
        expect(CC instanceof FreLimitedConcept).toBe(true);
        (CC as FreLimitedConcept).instances.forEach(inst => {
            switch (inst.name) {
                case "CC1": {
                    expect(inst.props.find(prop => prop.name === "AAprop1").value).toBe("some_text");
                    expect(inst.props.find(prop => prop.name === "AAprop2").valueList).toStrictEqual(["text1", "text2"]);
                    expect(inst.props.find(prop => prop.name === "AAprop3").value).toBe(78);
                    expect(inst.props.find(prop => prop.name === "AAprop4").valueList).toStrictEqual([102, 3489]);
                    expect(inst.props.find(prop => prop.name === "AAprop5").value).toBe(true);
                    expect(inst.props.find(prop => prop.name === "AAprop6").valueList).toStrictEqual([false, false]);
                    break;
                }
                case "CC2": {
                    expect(inst.props.find(prop => prop.name === "AAprop1").value).toBe("other_text");
                    expect(inst.props.find(prop => prop.name === "AAprop2")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop3").value).toBe(99999);
                    expect(inst.props.find(prop => prop.name === "AAprop4")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop5").value).toBe(false);
                    expect(inst.props.find(prop => prop.name === "AAprop6")).toBeUndefined();
                    break;
                }
                case "CC3": {
                    expect(inst.props.find(prop => prop.name === "AAprop1")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop2")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop3")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop4")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop5")).toBeUndefined();
                    expect(inst.props.find(prop => prop.name === "AAprop6")).toBeUndefined();
                    break;
                }
            }
        });
    });
});
