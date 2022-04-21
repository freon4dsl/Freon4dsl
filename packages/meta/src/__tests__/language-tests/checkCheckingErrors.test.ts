import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";

describe("Checking language parser on checking errors", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/checking-errors/";
    const parser = new LanguageParser();
    const checker = parser.checker;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    test("language should have a model concept", () => {
        try {
            parser.parse(testdir + "test1.ast");
        } catch (e) {
            expect(e.message).toBe(`checking errors (1).`);
            checker.errors.forEach(error =>
                expect(error).toBe("There should be a model in your language [file: test1.ast, line: 1, column: 1].")
            );
        }
    });

    test("language should have no more than one model concept and concepts and properties should have unique names", () => {
        try {
            parser.parse(testdir + "test2.ast");
        } catch (e) {
            // checker.errors.forEach(err => console.log(err));
            expect(e.message).toBe(`checking errors (12).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test2.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Type 'number' cannot be used as a reference, because it has no property 'name: identifier' [file: test2.ast, line: 10, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("A non-abstract limited concept must have instances [file: test2.ast, line: 14, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('string') [file: test2.ast, line: 19, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('number') [file: test2.ast, line: 21, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('boolean') [file: test2.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 'simple' already exists in ZZZ [file: test2.ast, line: 9, column: 5] and [file: test2.ast, line: 8, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'LowerCase' already exists [file: test2.ast, line: 27, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'AAA' already exists [file: test2.ast, line: 16, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("There may be only one model in the language definition [file: test2.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'ZZZ' already exists [file: test2.ast, line: 29, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'YYY' already exists [file: test2.ast, line: 31, column: 1].")).toBeTruthy();
        }
    });

    test("checking limitations on inheritance and implemented interfaces", () => {
        try {
            parser.parse(testdir + "test3.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (7).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test3.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Base 'AAA' must be a concept [file: test3.ast, line: 9, column: 18].")).toBeTruthy();
            expect(checker.errors.includes("A non-abstract limited concept must have instances [file: test3.ast, line: 17, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Limited concept 'AA' cannot be base of an unlimited concept [file: test3.ast, line: 13, column: 16].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'ZZ' is not an interface [file: test3.ast, line: 17, column: 23].")).toBeTruthy();
            expect(checker.errors.includes("A non-abstract limited concept must have instances [file: test3.ast, line: 11, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("A concept may not have an expression as base [file: test3.ast, line: 19, column: 18].")).toBeTruthy();
            let thereIsWarning: boolean = false;
            checker.warnings.forEach(warn => {
                if (warn.startsWith("Base 'ZZ' of limited concept")) {
                    thereIsWarning = true;
                }
            });
            expect(thereIsWarning).toBeTruthy();
        }
    });

    test("checking circular inheritance", () => {
        try {
            parser.parse(testdir + "test4.ast");
        } catch (e) {
            // checker.errors.forEach(err => console.log(err));
            expect(e.message).toBe(`checking errors (9).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test4.ast, line: 7, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: test4.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: test4.ast, line: 10, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: test4.ast, line: 13, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: test4.ast, line: 16, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: test4.ast, line: 19, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: test4.ast, line: 22, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 'prop1' already exists in yyy [file: test4.ast, line: 34, column: 5] and [file: test4.ast, line: 33, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property 'prop1' with non conforming type already exists in base concept 'yyy' [file: test4.ast, line: 28, column: 5] and [file: test4.ast, line: 33, column: 5].")).toBeTruthy();
        }
    });

    test("checking circular interfaces", () => {
        try {
            parser.parse(testdir + "test5.ast");
        } catch (e) {
            // checker.errors.forEach(err => console.log(err));
            expect(e.message).toBe(`checking errors (7).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test5.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: test5.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: test5.ast, line: 8, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: test5.ast, line: 11, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: test5.ast, line: 14, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: test5.ast, line: 18, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: test5.ast, line: 21, column: 1].")).toBeTruthy();
        }
    });

    test("checking expression concepts", () => {
        try {
            parser.parse(testdir + "test6.ast");
        } catch (e) {
            // checker.errors.forEach(err => console.log(err));
            expect(e.message).toBe(`checking errors (4).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test6.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a priority [file: test6.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a left part [file: test6.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a right part [file: test6.ast, line: 5, column: 1].")).toBeTruthy();
        }
    });

    test("checking limited concepts", () => {
        try {
            parser.parse(testdir + "test7.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (15).`);
            expect(checker.errors.includes("Type 'NoName' cannot be used as a reference, because it has no property 'name: identifier' [file: test7.ast, line: 4, column: 24].")).toBeTruthy();
            expect(checker.errors.includes("Type of property 'refProp' should be a modelunit [file: test7.ast, line: 4, column: 24].")).toBeTruthy();
            expect(checker.errors.includes("Type 'NameNotStringType' cannot be used as a reference, because it has no property 'name: identifier' [file: test7.ast, line: 5, column: 25].")).toBeTruthy();
            expect(checker.errors.includes("Type of property 'refProp2' should be a modelunit [file: test7.ast, line: 5, column: 25].")).toBeTruthy();
            expect(checker.errors.includes("The model should have at least one unit type [file: test7.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("All properties of a model must be parts, not references [file: test7.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("An abstract limited concept may not have any instances [file: test7.ast, line: 32, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 's' does not exist on concept RRRR [file: test7.ast, line: 13, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' (string) does not fit type (number) of property 'simple' [file: test7.ast, line: 14, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Property 's' does not exist on concept AA [file: test7.ast, line: 20, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' (string) does not fit type (number) of property 'simple' [file: test7.ast, line: 21, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'false' (string) does not fit type (boolean) of property 'prop2' [file: test7.ast, line: 23, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of '10' (string) does not fit type (boolean) of property 'prop2' [file: test7.ast, line: 24, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Instance with name 'instance5' already exists [file: test7.ast, line: 25, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Type of '10' (string) does not fit type (number) of property 'simple' [file: test7.ast, line: 25, column: 19].")).toBeTruthy();
        }
    });

    test("checking more limited concepts", () => {
        try {
            parser.parse(testdir + "test7a.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (3).`);
            expect(checker.errors.includes("Instance with name 'mmInstance1' already exists in the base concept [file: test7a.ast, line: 12, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Instance with name 'llInstance3' already exists in the base concept [file: test7a.ast, line: 13, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Instance with name 'kkInstance1' already exists [file: test7a.ast, line: 15, column: 5].")).toBeTruthy();
        }
    });

            test("checking limited concepts extended", () => {
        try {
            parser.parse(testdir + "test8.ast");
        } catch (e) {
            // checker.errors.forEach(err => console.log(err));
            expect(e.message).toBe(`checking errors (6).`);
            expect(checker.errors.includes("The model should have at least one unit type [file: test8.ast, line: 21, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 'ZZprop7' of limited concept should have primitive type [file: test8.ast, line: 12, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("A non-abstract limited concept must have instances [file: test8.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 'ZZprop7' does not exist on concept YY [file: test8.ast, line: 16, column: 21].")).toBeTruthy();
            expect(checker.errors.includes("A limited concept may not inherit or implement non-primitive parts [file: test8.ast, line: 15, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("A limited concept may not inherit or implement non-primitive parts [file: test8.ast, line: 3, column: 1].")).toBeTruthy();
        }
    });

    test("language should have a name", () => {
        try {
            parser.parse(testdir + "test10.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (1).`);
            expect(checker.errors.includes("There should be a model in your language [file: test10.ast, line: 1, column: 1].")).toBeTruthy();
        }
    });

    test("no initial value allowed in concept properties", () => {
        try {
            parser.parse(testdir + "test11.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (1).`);
            expect(checker.errors.includes("A non-primitive property may not have an initial value [file: test11.ast, line: 14, column: 5].")).toBeTruthy();
        }
    });

    test("expression as base of concept", () => {
        try {
            parser.parse(testdir + "test12.ast");
        } catch (e) {
            // console.log(checker.errors.map(err => err));
            expect(e.message).toBe(`checking errors (1).`);
            checker.errors.forEach(error =>
                expect(error).toBe("A concept may not have an expression as base [file: test12.ast, line: 11, column: 33].")
            );
        }
    });
});
