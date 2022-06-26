import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";

// The same tests as in property-inheritance1, only now some property types are lists
describe("Checking property inheritance on lists", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/property-inheritance4/";
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
            expect(e.message).toBe(`checking errors (3).`);
            expect(checker.errors.includes("Property 'name1' already exists in XXX [file: prop_test1.ast, line: 14, column: 5] and [file: prop_test1.ast, line: 13, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' already exists in XXX [file: prop_test1.ast, line: 16, column: 5] and [file: prop_test1.ast, line: 15, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' already exists in XXX [file: prop_test1.ast, line: 18, column: 5] and [file: prop_test1.ast, line: 17, column: 5].")).toBeTruthy();
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
            expect(e.message).toBe(`checking errors (3).`);
            expect(checker.errors.includes("Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 24, column: 5] and [file: prop_test2.ast, line: 18, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 25, column: 5] and [file: prop_test2.ast, line: 19, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast, line: 26, column: 5] and [file: prop_test2.ast, line: 20, column: 5].")).toBeTruthy();
        }
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
});
