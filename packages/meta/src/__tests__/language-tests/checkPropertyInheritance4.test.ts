import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils/index.js";
import { describe, test, expect } from "vitest";

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
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (3).`);
                expect(
                    checker.errors.includes(
                        "Property 'name1' already exists in XXX [file: prop_test1.ast:14:5] and [file: prop_test1.ast:13:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name2' already exists in XXX [file: prop_test1.ast:16:5] and [file: prop_test1.ast:15:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name3' already exists in XXX [file: prop_test1.ast:18:5] and [file: prop_test1.ast:17:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    // 2. all props defined in this classifier should be different from the props of its super concepts/interfaces
    //      except when their types conform, then props of the sub should be marked 'implementedInBase' - but only if
    //      base is a concept
    test("props in base concept on type equality", () => {
        const parseFile = testdir + "prop_test2.ast";
        try {
            parser.parse(parseFile);
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (3).`);
                expect(
                    checker.errors.includes(
                        "Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:24:5] and [file: prop_test2.ast:18:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:25:5] and [file: prop_test2.ast:19:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test2.ast:26:5] and [file: prop_test2.ast:20:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("props in single base concept on type conformance", () => {
        const parseFile = testdir + "prop_test4.ast";
        try {
            parser.parse(parseFile);
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n") );
                expect(e.message).toBe(`checking errors (4).`);
                expect(
                    checker.errors.includes(
                        "Property 'name2' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:34:5] and [file: prop_test4.ast:27:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name3' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:35:5] and [file: prop_test4.ast:28:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name4' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:36:5] and [file: prop_test4.ast:29:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'name1' with non conforming type already exists in base concept 'BaseConcept1' [file: prop_test4.ast:33:5] and [file: prop_test4.ast:26:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });
});
