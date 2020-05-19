import { LanguageParser } from "../parser/LanguageParser";

describe("Checking language parser on checking errors", () => {
    let testdir = "src/languagedef/__tests__/faultyDefFiles/checking-errors/";

    test("language should have a root concept", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test1.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            checker.errors.forEach(error =>
                expect(error).toBe("There should be a root concept in your language [line: 1, column: 1].")
            );
        }
    });

    test("language should have no more than one root concept and concepts and properties should have unique names", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test2.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("There may be only one root class in the language definition [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept with name 'ZZZ' already exists [line: 7, column: 1]."));
            expect(checker.errors.includes("Property with name 'simple' already exists in ZZZ [line: 9, column: 5].")).toBeTruthy();
            expect(checker.errors.includes("Reference to number cannot be resolved [line: 10, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Concept with name 'YYY' already exists [line: 12, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Concept or interface with name 'AAA' already exists [line: 16, column: 1].")).toBeTruthy();
        }
    });

    test("checking limitations on inheritance and implemented interfaces", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test3.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Base 'AAA' must be a concept [line: 9, column: 18].")).toBeTruthy();
            expect(checker.errors.includes("Base 'ZZ' of limited concept must be a limited concept [line: 11, column: 17].")).toBeTruthy();
            expect(checker.errors.includes("Limited concept 'AA' cannot be base of an unlimited concept [line: 13, column: 16].")).toBeTruthy();
            expect(checker.errors.includes("Concept 'ZZ' is not an interface [line: 18, column: 23].")).toBeTruthy();
        }
    });

    test("checking circular inheritance", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test4.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Binary expression concept YYY should have a priority [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a left part [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a right part [line: 5, column: 1].")).toBeTruthy();
        }
    });

    test("checking circular interfaces", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test5.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Binary expression concept YYY should have a priority [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a left part [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a right part [line: 5, column: 1].")).toBeTruthy();
        }
    });

    test("checking expression concepts", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test6.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Binary expression concept YYY should have a priority [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a left part [line: 5, column: 1].")).toBeTruthy();
            expect(checker.errors.includes("Binary expression concept YYY should have a right part [line: 5, column: 1].")).toBeTruthy();
        }
    });

    test("checking limited concepts", () => {
        let parser = new LanguageParser();
        let checker = parser.checker;
        let parseFile = testdir + "test7.lang";
        try {
            parser.parse(parseFile);
        } catch(e) {
            expect(e.message).toBe(`checking errors.`);
            expect(checker.errors.includes("Property 's' does not exist on concept RRRR [line: 7, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' does not equal type of property 'simple' [line: 8, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Property 's' does not exist on concept AA [line: 14, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of 'text' does not equal type of property 'simple' [line: 15, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Type of '10' does not equal type of property 'prop2' [line: 18, column: 19].")).toBeTruthy();
            expect(checker.errors.includes("Instance with name 'instance5' already exists [line: 19, column: 5].")).toBeTruthy();
        }
    });
});
