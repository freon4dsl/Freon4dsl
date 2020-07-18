
describe("Checking internal structure of language", () => {
    let testdir = "src/test/__tests__/language-tests/faultyDefFiles/internal-structure/";

    // TODO implement the following tests:

    // on PiLanguageUnit
    // there is a root concept
    // there is a single expression base
    // ??? predefined (primitive types)
    // if there is a classifier, we can find it

    // on PiConcept and PiInterface
    // no references in the parts list, and vice versa
    // no primProps in reference list
    // if a 'base' has a prop, we can find it
    // if an implemented interface has a prop, we can find it
    // we can find all subconcepts, also recursive
    // we can find all superconcepts, also recursive
    // we can find all subinterfaces, also recursive
    // we can find all superinterfaces, also recursive

    // on PiExpression
    // a binary expression has a left and a right part, and a priority

    // on PiProperty
    // test optional, list, part properties
    // test properties with limited concept as type
    // test isStatic prim properties
    // test initial value of properties

    // on PiInstance
    // PiInstance.concept should be a limited property
    // test PiInstance against its concept

    // on PiElementReference
    // all references can be found

    test("checking internal structure", () => {

    });
});
