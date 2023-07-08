import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { FreMetaLanguage } from "../../languagedef/metalanguage";

describe("Checking property inheritance", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/property-inheritance1/";
    const parser = new LanguageParser(undefined);
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
            expect(checker.errors.includes("Property 'name1' already exists in XXX [file: prop_test1.ast:14:5] and [file: prop_test1.ast:13:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' already exists in XXX [file: prop_test1.ast:16:5] and [file: prop_test1.ast:15:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' already exists in XXX [file: prop_test1.ast:18:5] and [file: prop_test1.ast:17:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' already exists in XXX [file: prop_test1.ast:20:5] and [file: prop_test1.ast:19:5].")).toBeTruthy();
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
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:26:5] and [file: prop_test2.ast:19:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:27:5] and [file: prop_test2.ast:20:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:28:5] and [file: prop_test2.ast:21:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:25:5] and [file: prop_test2.ast:18:5].")).toBeTruthy();
        }
    });

    test("props in single base concept on type equality: flag 'implementedInBase' is set", () => {
        const parseFile = testdir + "prop_test3.ast";
        let model: FreMetaLanguage = null;
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
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:34:5] and [file: prop_test4.ast:27:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:35:5] and [file: prop_test4.ast:28:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:36:5] and [file: prop_test4.ast:29:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:33:5] and [file: prop_test4.ast:26:5].")).toBeTruthy();
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
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast:26:5] and [file: prop_test4a.ast:39:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast:27:5] and [file: prop_test4a.ast:40:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast:28:5] and [file: prop_test4a.ast:41:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base concept 'BaseBaseBaseConcept' [file: prop_test4a.ast:29:5] and [file: prop_test4a.ast:42:5].")).toBeTruthy();
        }
    });

    // TODO make sure this test works again
    test.skip("props in base concept in inheritance tree on type conformance: flag 'implementedInBase' is set", () => {
        const parseFile = testdir + "prop_test4b.ast";
        let model: FreMetaLanguage = null;
        try {
            model = parser.parse(parseFile);
        } catch (e) {
            // console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBeNull();
        }
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        expect(rightOne).not.toBeNull();
        expect(rightOne).not.toBeUndefined();
        rightOne.allProperties().forEach(prop => {
            console.log(`${prop.name} is owned by ${prop.owningClassifier.name}: ${prop.implementedInBase}`);
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
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast:34:5] and [file: prop_test5.ast:27:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast:35:5] and [file: prop_test5.ast:28:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast:36:5] and [file: prop_test5.ast:29:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base2' [file: prop_test5.ast:33:5] and [file: prop_test5.ast:26:5].")).toBeTruthy();
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
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast:26:5] and [file: prop_test5a.ast:33:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast:26:5] and [file: prop_test5a.ast:40:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast:27:5] and [file: prop_test5a.ast:34:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast:27:5] and [file: prop_test5a.ast:41:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast:28:5] and [file: prop_test5a.ast:35:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast:28:5] and [file: prop_test5a.ast:42:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base_Base1' [file: prop_test5a.ast:29:5] and [file: prop_test5a.ast:36:5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name4' with non conforming type already exists in base interface 'Base_Base2' [file: prop_test5a.ast:29:5] and [file: prop_test5a.ast:43:5].")).toBeTruthy();
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
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast:34:5] and [file: prop_test6.ast:27:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast:35:5] and [file: prop_test6.ast:28:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast:36:5] and [file: prop_test6.ast:29:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base2' [file: prop_test6.ast:33:5] and [file: prop_test6.ast:26:5].")).toBeTruthy();
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
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast:26:5] and [file: prop_test6a.ast:33:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast:26:5] and [file: prop_test6a.ast:47:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast:26:5] and [file: prop_test6a.ast:40:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast:27:5] and [file: prop_test6a.ast:34:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast:27:5] and [file: prop_test6a.ast:48:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast:27:5] and [file: prop_test6a.ast:41:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast:28:5] and [file: prop_test6a.ast:35:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast:28:5] and [file: prop_test6a.ast:49:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast:28:5] and [file: prop_test6a.ast:42:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base2' [file: prop_test6a.ast:29:5] and [file: prop_test6a.ast:36:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base_Base2' [file: prop_test6a.ast:29:5] and [file: prop_test6a.ast:50:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base_Base1' [file: prop_test6a.ast:29:5] and [file: prop_test6a.ast:43:5].")).toBeTruthy();

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
            expect(checker.errors.includes("Concept 'Wrong1': property 'name1' in 'Base3' does not conform to property 'name1' in 'Base2' [file: prop_test7.ast:23:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name2' in 'Base3' does not conform to property 'name2' in 'Base2' [file: prop_test7.ast:23:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name4' in 'Base3' does not conform to property 'name4' in 'Base2' [file: prop_test7.ast:23:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name3' in 'Base3' does not conform to property 'name3' in 'Base2' [file: prop_test7.ast:23:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name1' in 'Base4' does not conform to property 'name1' in 'Base2' [file: prop_test7.ast:27:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name2' in 'Base4' does not conform to property 'name2' in 'Base2' [file: prop_test7.ast:27:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name4' in 'Base4' does not conform to property 'name4' in 'Base2' [file: prop_test7.ast:27:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong2': property 'name3' in 'Base4' does not conform to property 'name3' in 'Base2' [file: prop_test7.ast:27:1].")).toBeTruthy();
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
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast:26:5] and [file: prop_test7a.ast:56:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast:27:5] and [file: prop_test7a.ast:57:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast:28:5] and [file: prop_test7a.ast:58:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base3' [file: prop_test7a.ast:29:5] and [file: prop_test7a.ast:59:5].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name5' in 'Base3' does not conform to property 'name5' in 'Base5' [file: prop_test7a.ast:25:1].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'Wrong1': property 'name6' in 'Base3' does not conform to property 'name6' in 'Base5' [file: prop_test7a.ast:25:1].")).toBeTruthy();

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
            expect(checker.errors.includes("(Inherited) property 'name1' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast:35:5] and [file: prop_test8.ast:46:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name2' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast:36:5] and [file: prop_test8.ast:47:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name3' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast:37:5] and [file: prop_test8.ast:48:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name4' with non conforming type exists in implemented interface 'Base1' [file: prop_test8.ast:38:5] and [file: prop_test8.ast:49:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name5' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast:39:5] and [file: prop_test8.ast:53:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name6' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast:40:5] and [file: prop_test8.ast:54:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name7' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast:41:5] and [file: prop_test8.ast:55:5].")).toBeTruthy();
            expect(checker.errors.includes("(Inherited) property 'name8' with non conforming type exists in implemented interface 'Base2' [file: prop_test8.ast:42:5] and [file: prop_test8.ast:56:5].")).toBeTruthy();

        }
    });
});
