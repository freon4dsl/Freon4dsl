import { LanguageParser } from "../../../languagedef/parser/LanguageParser";

describe("Checking language parser on checking errors", () => {
    const testdir = "src/test/__tests__/language-tests/faultyDefFiles/checking-errors/";
    const parser = new LanguageParser();
    const checker = parser.checker;

    test("language should have a model concept", () => {
        const parseFile = testdir + "test1.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            checker.errors.forEach(error =>
                expect(error).toBe("There should be a model in your language [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test1.ast, line: 1, column: 1].")
            );
        }
    });

    test("language should have no more than one model concept and concepts and properties should have unique names", () => {
        const parseFile = testdir + "test2.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            // TODO check the extra error messages
            expect(checker.errors.includes("There may be only one model in the language definition [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept with name 'ZZZ' already exists [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 7, column: 1]."));
            expect(checker.errors.includes("Property with name 'simple' already exists in ZZZ [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 8, column: 5] and [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 9, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Concept with name 'YYY' already exists [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 12, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'AAA' already exists [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 16, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('string') [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 19, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('number') [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 21, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept may not have a name that is equal to a reserved word in TypeScript ('boolean') [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 23, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept with name 'LowerCase' already exists [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test2.ast, line: 27, column: 1].")).toBeTruthy();

        }
    });

    test("checking limitations on inheritance and implemented interfaces", () => {
        const parseFile = testdir + "test3.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Base 'AAA' must be a concept [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test3.ast, line: 9, column: 18].")).toBeTruthy();
            expect(checker.errors.includes("Base 'ZZ' of limited concept must be a limited concept [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test3.ast, line: 11, column: 17].")).toBeTruthy();
            expect(checker.errors.includes("Limited concept 'AA' cannot be base of an unlimited concept [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test3.ast, line: 13, column: 16].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'ZZ' is not an interface [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test3.ast, line: 18, column: 23].")).toBeTruthy();
        }
    });

    test("checking circular inheritance", () => {
        const parseFile = testdir + "test4.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 7, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 10, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 13, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 16, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 18, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property with name 'prop1' already exists in xxx [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 29, column: 5] and [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 24, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property with name 'prop1' already exists in xxx [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 29, column: 5] and [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 30, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Property with name 'prop1' already exists in yyy [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 29, column: 5] and [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test4.ast, line: 30, column: 5].")).toBeTruthy();
        }
    });

    test("checking circular interfaces", () => {
        const parseFile = testdir + "test5.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Concept or interface 'AAA' is part of a forbidden circular inheritance tree (AAA, BBB) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'CCC' is part of a forbidden circular inheritance tree (CCC, DDD, EEE, FFF) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 8, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'DDD' is part of a forbidden circular inheritance tree (DDD, EEE, FFF, CCC) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 11, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'EEE' is part of a forbidden circular inheritance tree (EEE, FFF, CCC, DDD) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 14, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'FFF' is part of a forbidden circular inheritance tree (FFF, CCC, DDD, EEE) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 18, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface 'BBB' is part of a forbidden circular inheritance tree (BBB, AAA) [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test5.ast, line: 21, column: 1].")).toBeTruthy();
        }
    });

    test("checking expression concepts", () => {
        const parseFile = testdir + "test6.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Binary expression concept YYY should have a priority [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test6.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a left part [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test6.ast, line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a right part [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test6.ast, line: 5, column: 1].")).toBeTruthy();
        }
    });

    test("checking limited concepts", () => {
        const parseFile = testdir + "test7.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Type 'NoName' cannot be used as a reference, because it has no name property [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 4, column: 24].")).toBeTruthy();
            expect(checker.errors.includes("Type 'NameNotStringType' cannot be used as a reference, because its name property is not of type 'string' [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 5, column: 25].")).toBeTruthy();
            expect(checker.errors.includes("Property 's' does not exist on concept RRRR [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 13, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' does not equal type of property 'simple' [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 14, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Property 's' does not exist on concept AA [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 20, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' does not equal type of property 'simple' [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 21, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of '10' does not equal type of property 'prop2' [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 24, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Instance with name 'instance5' already exists [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test7.ast, line: 25, column: 5].")).toBeTruthy();
        }
    });

    test("checking limited concepts extended", () => {
        const parseFile = testdir + "test8.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Property 'ZZprop7' of limited concept should have primitive type [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test8.ast, line: 12, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("A non-abstract limited concept must have instances [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test8.ast, line: 3, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Property 'ZZprop7' does not exist on concept YY [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test8.ast, line: 16, column: 21].")).toBeTruthy();
        }
    });

    test("language should have a name", () => {
        const parseFile = testdir + "test10.ast";
        try {
            parser.parse(parseFile);
        } catch (e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Language should have a name [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test10.ast, line: 1, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("There should be a model in your language [file: src/test/__tests__/language-tests/faultyDefFiles/checking-errors/test10.ast, line: 1, column: 1].")).toBeTruthy();
        }
    });
});
