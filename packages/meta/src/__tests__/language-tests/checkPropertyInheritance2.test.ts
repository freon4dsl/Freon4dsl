import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { PiLanguage } from "../../languagedef/metalanguage";

// The same tests as in property-inheritance1, only now all property types are interfaces
describe("Checking property inheritance", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/property-inheritance2/";
    const parser = new LanguageParser();
    const checker = parser.checker;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    // to be tested
    // 1. all props defined in this classifier against themselves:
    // no prop with same name allowed, not even if they have the same type
    test("props in same classifier", () => {
        const parseFile = testdir + "prop_test1.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("Property 'name1' already exists in XXX [file: prop_test1.ast, line: 14, column: 5] and [file: prop_test1.ast, line: 13, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' already exists in XXX [file: prop_test1.ast, line: 16, column: 5] and [file: prop_test1.ast, line: 15, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' already exists in XXX [file: prop_test1.ast, line: 18, column: 5] and [file: prop_test1.ast, line: 17, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' already exists in XXX [file: prop_test1.ast, line: 20, column: 5] and [file: prop_test1.ast, line: 19, column: 5].")).toBeTruthy();
        }
    });

    // 2. all props defined in this classifier should be different from the props of its super concepts/interfaces
    //      except when their types conform, then props of the sub should be marked 'implementedInBase' - but only if
    //      base is a concept
    test("props in base concept on type equality", () => {
        const parseFile = testdir + "prop_test2.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 26, column: 5] and [file: prop_test2.ast, line: 19, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 27, column: 5] and [file: prop_test2.ast, line: 20, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 28, column: 5] and [file: prop_test2.ast, line: 21, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 25, column: 5] and [file: prop_test2.ast, line: 18, column: 5].")).toBeTruthy();
        }
    });

    test("props in single base concept on type equality: flag 'implementedInBase' is set", () => {
        const parseFile = testdir + "prop_test3.ast";
        let model: PiLanguage = null;
        try {
            model = parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBeNull();
         }
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        rightOne.allProperties().forEach(prop => {
            expect(prop.implementedInBase).toBeTruthy();
        });
    });

    test("props in single base concept on type conformance", () => {
        const parseFile = testdir + "prop_test4.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast, line: 34, column: 5] and [file: prop_test4.ast, line: 27, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast, line: 35, column: 5] and [file: prop_test4.ast, line: 28, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast, line: 36, column: 5] and [file: prop_test4.ast, line: 29, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast, line: 33, column: 5] and [file: prop_test4.ast, line: 26, column: 5].")).toBeTruthy();
        }
    });

    // test inheritance tree, i.e. multiple levels - concepts
    test("props in base concepts in inheritance tree on type conformance", () => {
        const parseFile = testdir + "prop_test4a.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast, line: 26, column: 5] and [file: prop_test4a.ast, line: 39, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast, line: 27, column: 5] and [file: prop_test4a.ast, line: 40, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast, line: 28, column: 5] and [file: prop_test4a.ast, line: 41, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast, line: 29, column: 5] and [file: prop_test4a.ast, line: 42, column: 5].")).toBeTruthy();
        }
    });

    // TODO make sure this test works again
    test.skip("props in base concept in inheritance tree on type conformance: flag 'implementedInBase' is set", () => {
        const parseFile = testdir + "prop_test4b.ast";
        let model: PiLanguage = null;
        try {
            model = parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBeNull();
        }
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        rightOne.allProperties().forEach(prop => {
            expect(prop.implementedInBase).toBeTruthy();
        });
    });

    test("props in single base interface on type conformance", () => {
        const parseFile = testdir + "prop_test5.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast, line: 34, column: 5] and [file: prop_test5.ast, line: 27, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast, line: 35, column: 5] and [file: prop_test5.ast, line: 28, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast, line: 36, column: 5] and [file: prop_test5.ast, line: 29, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast, line: 33, column: 5] and [file: prop_test5.ast, line: 26, column: 5].")).toBeTruthy();
        }
    });

    // test inheritance tree, i.e. multiple levels - interfaces
    test("props in multiple base interfaces on type conformance", () => {
        const parseFile = testdir + "prop_test5a.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (8).`);
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast, line: 26, column: 5] and [file: prop_test5a.ast, line: 33, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast, line: 26, column: 5] and [file: prop_test5a.ast, line: 40, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast, line: 27, column: 5] and [file: prop_test5a.ast, line: 34, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast, line: 27, column: 5] and [file: prop_test5a.ast, line: 41, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast, line: 28, column: 5] and [file: prop_test5a.ast, line: 35, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast, line: 28, column: 5] and [file: prop_test5a.ast, line: 42, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast, line: 29, column: 5] and [file: prop_test5a.ast, line: 36, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast, line: 29, column: 5] and [file: prop_test5a.ast, line: 43, column: 5].")).toBeTruthy();
        }
    });

    // 3. all props defined in this concept against props from implemented interfaces: name and type should conform
    test("props in implemented interface on type conformance", () => {
        const parseFile = testdir + "prop_test6.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast, line: 34, column: 5] and [file: prop_test6.ast, line: 27, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast, line: 35, column: 5] and [file: prop_test6.ast, line: 28, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast, line: 36, column: 5] and [file: prop_test6.ast, line: 29, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast, line: 33, column: 5] and [file: prop_test6.ast, line: 26, column: 5].")).toBeTruthy();
        }
    });

    test("props in implemented interface on type conformance - with inheritance tree", () => {
        const parseFile = testdir + "prop_test6a.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (12).`);
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast, line: 26, column: 5] and [file: prop_test6a.ast, line: 33, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast, line: 26, column: 5] and [file: prop_test6a.ast, line: 47, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast, line: 26, column: 5] and [file: prop_test6a.ast, line: 40, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast, line: 27, column: 5] and [file: prop_test6a.ast, line: 34, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast, line: 27, column: 5] and [file: prop_test6a.ast, line: 48, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast, line: 27, column: 5] and [file: prop_test6a.ast, line: 41, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast, line: 28, column: 5] and [file: prop_test6a.ast, line: 35, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast, line: 28, column: 5] and [file: prop_test6a.ast, line: 49, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast, line: 28, column: 5] and [file: prop_test6a.ast, line: 42, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast, line: 29, column: 5] and [file: prop_test6a.ast, line: 36, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast, line: 29, column: 5] and [file: prop_test6a.ast, line: 50, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast, line: 29, column: 5] and [file: prop_test6a.ast, line: 43, column: 5].")).toBeTruthy();

        }
    });

    // 4. all props defined in implemented interfaces, that do not have a counterpart in the concept or its supers,
    //      should not have a name equal to any other, except when their types conform.
    test("props in various implemented interfaces against eachother", () => {
        const parseFile = testdir + "prop_test7.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (8).`);
            expect(checker.errors.includes("Concept 'Wrong1': property 'name1' in 'Base3' does not conform to property 'name1' in 'Base2' [file: prop_test7.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name2' in 'Base3' does not conform to property 'name2' in 'Base2' [file: prop_test7.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name4' in 'Base3' does not conform to property 'name4' in 'Base2' [file: prop_test7.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name3' in 'Base3' does not conform to property 'name3' in 'Base2' [file: prop_test7.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name1' in 'Base4' does not conform to property 'name1' in 'Base2' [file: prop_test7.ast, line: 27, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name2' in 'Base4' does not conform to property 'name2' in 'Base2' [file: prop_test7.ast, line: 27, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name4' in 'Base4' does not conform to property 'name4' in 'Base2' [file: prop_test7.ast, line: 27, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name3' in 'Base4' does not conform to property 'name3' in 'Base2' [file: prop_test7.ast, line: 27, column: 1].")).toBeTruthy();
        }
    });

    test("props in various implemented interfaces against eachother - with counterparts in concept", () => {
        const parseFile = testdir + "prop_test7a.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (6).`);
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast, line: 26, column: 5] and [file: prop_test7a.ast, line: 56, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast, line: 27, column: 5] and [file: prop_test7a.ast, line: 57, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast, line: 28, column: 5] and [file: prop_test7a.ast, line: 58, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast, line: 29, column: 5] and [file: prop_test7a.ast, line: 59, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name5' in 'Base3' does not conform to property 'name5' in 'Base5' [file: prop_test7a.ast, line: 25, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name6' in 'Base3' does not conform to property 'name6' in 'Base5' [file: prop_test7a.ast, line: 25, column: 1].")).toBeTruthy();

        }
    });

    // 5. all properties of super concepts must conform props of all interfaces
    test("props of super concepts must conform props of all interfaces", () => {
        const parseFile = testdir + "prop_test8.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBe(`checking errors (8).`);
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast, line: 35, column: 5] and [file: prop_test8.ast, line: 46, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast, line: 36, column: 5] and [file: prop_test8.ast, line: 47, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast, line: 37, column: 5] and [file: prop_test8.ast, line: 48, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast, line: 38, column: 5] and [file: prop_test8.ast, line: 49, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name5' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast, line: 39, column: 5] and [file: prop_test8.ast, line: 53, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name6' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast, line: 40, column: 5] and [file: prop_test8.ast, line: 54, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name7' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast, line: 41, column: 5] and [file: prop_test8.ast, line: 55, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name8' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast, line: 42, column: 5] and [file: prop_test8.ast, line: 56, column: 5].")).toBeTruthy();

        }
    });
});
