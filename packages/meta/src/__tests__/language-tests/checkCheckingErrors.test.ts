import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import { describe, test, expect } from "vitest";

describe("Checking language parser on checking errors", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/checking-errors/";
    const parser = new LanguageParser();
    const checker = parser.checker;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    test("language should have a model concept", () => {
        try {
            parser.parse(testdir + "test1.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                expect(e.message).toBe(`checking errors (1).`);
                checker.errors.forEach((error) =>
                    expect(error).toBe("There should be a model in your language [file: test1.ast:1:1]."),
                );
            }
        }
    });

    test("language should have no more than one model concept and concepts and properties should have unique names", () => {
        try {
            parser.parse(testdir + "test2.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // checker.errors.forEach(err => console.log(err));
                expect(e.message).toBe(`checking errors (12).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test2.ast:3:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type 'number' cannot be used as a reference, because it has no property 'name: identifier' [file: test2.ast:10:19].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A non-abstract limited concept must have instances [file: test2.ast:14:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept may not have a name that is equal to a reserved word in TypeScript ('string') [file: test2.ast:19:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept may not have a name that is equal to a reserved word in TypeScript ('number') [file: test2.ast:21:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept may not have a name that is equal to a reserved word in TypeScript ('boolean') [file: test2.ast:23:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'simple' already exists in ZZZ [file: test2.ast:9:5] and [file: test2.ast:8:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface with name 'LowerCase' already exists [file: test2.ast:27:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface with name 'AAA' already exists [file: test2.ast:16:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "There may be only one model in the language definition [file: test2.ast:5:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface with name 'ZZZ' already exists [file: test2.ast:29:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface with name 'YYY' already exists [file: test2.ast:31:1].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("checking limitations on inheritance and implemented interfaces", () => {
        try {
            parser.parse(testdir + "test3.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => err));
                expect(e.message).toBe(`checking errors (7).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test3.ast:3:1]."),
                ).toBeTruthy();
                expect(checker.errors.includes("Base 'AAA' must be a concept [file: test3.ast:9:18].")).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A non-abstract limited concept must have instances [file: test3.ast:17:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Limited concept 'AA' cannot be base of an unlimited concept [file: test3.ast:13:16].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Concept 'ZZ' is not an interface [file: test3.ast:17:23]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A non-abstract limited concept must have instances [file: test3.ast:11:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("A concept may not have an expression as base [file: test3.ast:19:18]."),
                ).toBeTruthy();
                let thereIsWarning: boolean = false;
                checker.warnings.forEach((warn) => {
                    if (warn.startsWith("Base 'ZZ' of limited concept")) {
                        thereIsWarning = true;
                    }
                });
                expect(thereIsWarning).toBeTruthy();
            }
        }
    });

    test("checking circular inheritance", () => {
        try {
            parser.parse(testdir + "test4.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // checker.errors.forEach(err => console.log(err));
                expect(e.message).toBe(`checking errors (9).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test4.ast:7:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: test4.ast:3:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: test4.ast:10:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: test4.ast:13:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: test4.ast:16:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: test4.ast:19:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: test4.ast:22:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'prop1' already exists in yyy [file: test4.ast:34:5] and [file: test4.ast:33:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'prop1' with non conforming type already exists in base concept 'yyy' [file: test4.ast:28:5] and [file: test4.ast:33:5].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("checking circular interfaces", () => {
        try {
            parser.parse(testdir + "test5.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // checker.errors.forEach(err => console.log(err));
                expect(e.message).toBe(`checking errors (7).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test5.ast:3:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: test5.ast:5:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: test5.ast:8:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: test5.ast:11:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: test5.ast:14:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: test5.ast:18:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: test5.ast:21:1].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("checking expression concepts", () => {
        try {
            parser.parse(testdir + "test6.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // checker.errors.forEach(err => console.log(err));
                expect(e.message).toBe(`checking errors (4).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test6.ast:3:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Binary expression concept YYY should have a priority [file: test6.ast:5:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Binary expression concept YYY should have a left part [file: test6.ast:5:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Binary expression concept YYY should have a right part [file: test6.ast:5:1].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("checking limited concepts", () => {
        try {
            parser.parse(testdir + "test7.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => err));
                expect(e.message).toBe(`checking errors (15).`);
                expect(
                    checker.errors.includes(
                        "Type 'NoName' cannot be used as a reference, because it has no property 'name: identifier' [file: test7.ast:4:24].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Type of property 'refProp' should be a modelunit [file: test7.ast:4:24]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type 'NameNotStringType' cannot be used as a reference, because it has no property 'name: identifier' [file: test7.ast:5:25].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of property 'refProp2' should be a modelunit [file: test7.ast:5:25].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("The model should have at least one part [file: test7.ast:3:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "All properties of a model must be parts, not references [file: test7.ast:3:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "An abstract limited concept may not have any instances [file: test7.ast:32:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Property 's' does not exist on concept RRRR [file: test7.ast:13:19]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'text' (string) does not fit type (number) of property 'simple' [file: test7.ast:14:19].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Property 's' does not exist on concept AA [file: test7.ast:20:19]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'text' (string) does not fit type (number) of property 'simple' [file: test7.ast:21:19].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'false' (string) does not fit type (boolean) of property 'prop2' [file: test7.ast:23:19].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of '10' (string) does not fit type (boolean) of property 'prop2' [file: test7.ast:24:19].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Instance with name 'instance5' already exists [file: test7.ast:25:5]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of '10' (string) does not fit type (number) of property 'simple' [file: test7.ast:25:19].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("checking more limited concepts", () => {
        try {
            parser.parse(testdir + "test7a.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => err));
                expect(e.message).toBe(`checking errors (3).`);
                expect(
                    checker.errors.includes(
                        "Instance with name 'mmInstance1' already exists in the base concept [file: test7a.ast:12:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Instance with name 'llInstance3' already exists in the base concept [file: test7a.ast:13:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Instance with name 'kkInstance1' already exists [file: test7a.ast:15:5]."),
                ).toBeTruthy();
            }
        }
    });

    test("checking limited concepts extended", () => {
        try {
            parser.parse(testdir + "test8.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // checker.errors.forEach(err => console.log(err));
                expect(e.message).toBe(`checking errors (6).`);
                expect(
                    checker.errors.includes("The model should have at least one part [file: test8.ast:21:1]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property 'ZZprop7' of limited concept should have primitive type [file: test8.ast:12:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A non-abstract limited concept must have instances [file: test8.ast:3:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Property 'ZZprop7' does not exist on concept YY [file: test8.ast:16:21]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A limited concept may not inherit or implement non-primitive parts [file: test8.ast:15:1].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "A limited concept may not inherit or implement non-primitive parts [file: test8.ast:3:1].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("language should have a name", () => {
        try {
            parser.parse(testdir + "test10.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => err));
                expect(e.message).toBe(`checking errors (1).`);
                expect(
                    checker.errors.includes("There should be a model in your language [file: test10.ast:1:1]."),
                ).toBeTruthy();
            }
        }
    });

    test("no initial value allowed in concept properties", () => {
        try {
            parser.parse(testdir + "test11.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log("ERRORS: " + checker.errors.map(e => e + "\n"))
                expect(e.message).toBe(`checking errors (9).`);
                expect(
                    checker.errors.includes(
                        "Non-primitive property 'prop1' may not have an initial value [file: test11.ast:14:12].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'this should be a number' (string) does not fit type (number) of property 'numberProp1' [file: test11.ast:15:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'true' (boolean) does not fit type (number) of property 'numberProp2' [file: test11.ast:16:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Type of 'Color:red' (Color) does not fit type (number) of property 'numberProp3' [file: test11.ast:17:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Non-primitive property 'prop1' may not have an initial value [file: test11.ast:14:12].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property limitedProp2 has incorrect initializer type, should be a limited literal [file: test11.ast:20:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Property limitedProp3 has incorrect initializer type, should be a limited literal [file: test11.ast:21:5].",
                    ),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Type of Size does not fit Color of limitedProp4 [file: test11.ast:22:5]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes("Type of Size does not fit Color of limitedProp5 [file: test11.ast:23:5]."),
                ).toBeTruthy();
                expect(
                    checker.errors.includes(
                        "Literal 'green' does not exist in limited 'Color' at [file: test11.ast:24:19].",
                    ),
                ).toBeTruthy();
            }
        }
    });

    test("expression as base of concept", () => {
        try {
            parser.parse(testdir + "test12.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => err));
                expect(e.message).toBe(`checking errors (2).`);
                expect(
                    checker.errors.includes(
                        "An entry with this part ('testUnit') already exists [file: test12.ast:6:5].",
                    ),
                );
                expect(
                    checker.errors.includes("A concept may not have an expression as base [file: test12.ast:12:33]."),
                );
            }
        }
    });
});
