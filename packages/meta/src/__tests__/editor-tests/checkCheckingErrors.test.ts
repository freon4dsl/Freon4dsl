import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { Checker, MetaLogger } from "../../utils";
import { FreEditParser } from "../../editordef/parser/FreEditParser";
import { FreEditUnit } from "../../editordef/metalanguage";
import { describe, test, expect, beforeEach } from "vitest"

describe("Checking editor definition ", () => {
    const testdir = "src/__tests__/editor-tests/faultyDefFiles/checking-errors/";
    let parser: FreEditParser;
    let language: FreMetaLanguage | undefined;
    let checker: Checker<FreEditUnit>;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
            if (!!language) {
                parser = new FreEditParser(language);
                checker = parser.checker;
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
    });

    test("an empty projection in the .edit file is not ok", () => {
        try {
            parser.parse(testdir + "test1.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (3).`);
                expect(checker.errors.includes("No empty projections allowed [file: test1.edit:3:10].")).toBeTruthy();
                expect(checker.errors.includes("No empty projections allowed [file: test1.edit:11:5].")).toBeTruthy();
                expect(checker.errors.includes("No empty projections allowed [file: test1.edit:13:5].")).toBeTruthy();
            }
        }
    });

    test("a concept cannot have two 'normal' or two 'table' projections in a group", () => {
        try {
            parser.parse(testdir + "test2.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (2).`);
                expect(checker.errors
                    .includes("There may be only one 'normal' (non-table) projection for AAAAAA in a projection group [file: test2.edit:15:10].")).toBeTruthy();
                expect(checker.errors.includes("There may be only one table projection for AAAAAA in a projection group [file: test2.edit:39:1].")).toBeTruthy();
            }
        }
    });

    test("each trigger or symbol must be unique", () => {
        try {
            parser.parse(testdir + "test3.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (5).`);
                expect(checker.errors.includes("Trigger ee of EE is not unique (found 1 similar ones) [file: test3.edit:42:5].")).toBeTruthy();
                expect(checker.errors.includes("Trigger ee of FF is not unique (found 1 similar ones) [file: test3.edit:50:5].")).toBeTruthy();
                expect(checker.errors.includes("Symbol aa (and therefore trigger) of AAAAAA is equal to 1 other trigger(s) [file: test3.edit:11:4].")).toBeTruthy();
                expect(checker.errors.includes("Symbol aa (and therefore trigger) of BB is equal to 1 other trigger(s) [file: test3.edit:21:4].")).toBeTruthy();
                expect(checker.errors.includes("Symbol :: (and therefore trigger) of DD is equal to 1 other trigger(s) [file: test3.edit:35:5].")).toBeTruthy();
            }
        }
    });

    test("no triggers, symbols may be defined more than once for every concept", () => {
        try {
            parser.parseMulti([testdir + "test4a.edit", testdir + "test4b.edit"]);
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (4).`);
                expect(checker.errors
                    .includes("trigger for classifier AAAAAA is already defined: [file: test4a.edit:21:4] and [file: test4a.edit:11:4].")).toBeTruthy();
                expect(checker.errors
                    .includes("trigger for classifier AAAAAA is already defined: [file: test4b.edit:11:4] and [file: test4a.edit:11:4].")).toBeTruthy();
                expect(checker.errors
                    .includes("symbol for classifier AAAAAA is already defined: [file: test4b.edit:21:4] and [file: test4a.edit:11:4].")).toBeTruthy();
                expect(checker.errors
                    .includes("trigger for classifier AAAAAA is already defined: [file: test4b.edit:21:4] and [file: test4a.edit:11:4].")).toBeTruthy();
            }
        }
    });

    test("named projections should be defined", () => {
        try {
            parser.parseMulti([testdir + "test5a.edit", testdir + "test5b.edit", testdir + "test5c.edit"]);
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (3).`);
                expect(checker.errors.includes("Cannot find a projection named 'group34' for concept or interface 'DD' [file: test5a.edit:6:14].")).toBeTruthy();
                expect(checker.errors.includes("Cannot find a projection named 'group45' for concept or interface 'DD' [file: test5b.edit:7:5].")).toBeTruthy();
                expect(checker.errors.includes("Cannot find a projection named 'group67' for concept or interface 'DD' [file: test5c.edit:6:5].")).toBeTruthy();
            }
        }
    });

    test("only one property in an optional projection", () => {
        try {
            parser.parse(testdir + "test6.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (2).`);
                expect(checker.errors.includes("There should be (only) one property within an optional projection, found 2 [file: test6.edit:4:5].")).toBeTruthy();
                expect(checker.errors.includes("There should be (only) one property within an optional projection, found 3 [file: test6.edit:5:5].")).toBeTruthy();
            }
        }
    });

    test("limited concepts have no projection", () => {
        try {
            parser.parse(testdir + "test7.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (2).`);
                expect(checker.errors
                    .includes("A limited concept cannot have a projection, it can only be used as reference [file: test7.edit:3:5].")).toBeTruthy();
                expect(checker.errors.includes("An optional boolean property is not allowed within an optional projection [file: test7.edit:12:8].")).toBeTruthy();
            }
        }
    });

    test("table projection is allowed for part properties only", () => {
        try {
            parser.parse(testdir + "test8.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // console.log(checker.warnings.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (4).`);
                expect(checker.errors.includes("Only properties that are lists can be displayed as list or table [file: test8.edit:5:5].")).toBeTruthy();
                expect(checker.errors.includes("Only properties that are lists can be displayed as list or table [file: test8.edit:7:3].")).toBeTruthy();
                expect(checker.errors.includes("Only properties that are lists can be displayed as list or table [file: test8.edit:10:5].")).toBeTruthy();
                expect(checker.errors.includes("Only properties that are lists can be displayed as list or table [file: test8.edit:12:5].")).toBeTruthy();
                expect(checker.warnings
                    .includes("References cannot be shown as table, property 'AAprop10' will be shown as list instead [file: test8.edit:8:5].")).toBeTruthy();
                expect(checker.warnings
                    .includes("References cannot be shown as table, property 'AAprop14' will be shown as list instead [file: test8.edit:13:5].")).toBeTruthy();
            }
        }
    });

    test("keywords are only allowed for non-list boolean properties", () => {
        try {
            parser.parse(testdir + "test9.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {            // console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (2).`);
                expect(checker.errors.includes("Property 'AAprop6' may not have a keyword projection, because it is a list [file: test9.edit:5:5].")).toBeTruthy();
                expect(checker.errors.includes("Property 'BBprop6' may not have a keyword projection, because it is a list [file: test9.edit:11:5].")).toBeTruthy();
            }
        }
    });

    test("on standard displays for primitives and limiteds", () => {
        try {
            parser.parse(testdir + "test10.edit");
        } catch (e: unknown) {
            console.log(e);
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (5).`);
                expect(checker.errors.includes("A boolean value may only be displayed as 'text', 'checkbox', 'radio', 'switch', or 'inner-switch' [file: test10.edit:4:5].")).toBeTruthy();
                expect(checker.errors.includes("A number value may only be displayed as 'text', or 'slider' [file: test10.edit:5:5].")).toBeTruthy();
                expect(checker.errors.includes("A limited (enum) value may only be displayed as 'text', or 'radio' [file: test10.edit:6:5].")).toBeTruthy();
                expect(checker.errors.includes("A list of limited (enum) values may only be displayed as 'text', or 'checkbox' [file: test10.edit:7:5].")).toBeTruthy();
                expect(checker.errors.includes("The text for a separator should not include any whitespace [file: test10.edit:8:5].")).toBeTruthy();
            }
        }
    });

    test("on display types for limiteds", () => {
        try {
            parser.parse(testdir + "test11.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (11).`);
                expect(checker.errors.includes("A number value may only be displayed as 'text', or 'slider' [file: test11.edit:10:5].")).toBeTruthy();
                expect(checker.errors.includes("A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]', found type 'number[]' [file: test11.edit:11:5].")).toBeTruthy();
                expect(checker.errors.includes("A boolean value may only be displayed as 'text', 'checkbox', 'radio', 'switch', or 'inner-switch' [file: test11.edit:13:5].")).toBeTruthy();
                expect(checker.errors.includes("A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]', found type 'boolean[]' [file: test11.edit:19:5].")).toBeTruthy();
                expect(checker.errors.includes("A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]' [file: test11.edit:21:5].")).toBeTruthy();
                expect(checker.errors.includes("A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]', found type 'BB[]' [file: test11.edit:22:5].")).toBeTruthy();
                expect(checker.errors.includes("A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]' [file: test11.edit:23:5].")).toBeTruthy();
                expect(checker.errors.includes("A limited (enum) value may only be displayed as 'text', or 'radio' [file: test11.edit:27:5].")).toBeTruthy();
                expect(checker.errors.includes("A limited (enum) value may only be displayed as 'text', or 'radio' [file: test11.edit:28:5].")).toBeTruthy();
                expect(checker.errors.includes("A list of limited (enum) values may only be displayed as 'text', or 'checkbox' [file: test11.edit:32:5].")).toBeTruthy();
                expect(checker.errors.includes("A list of limited (enum) values may only be displayed as 'text', or 'checkbox' [file: test11.edit:33:5].")).toBeTruthy();
            }
        }
    });

    test("on multiple standard definitions", () => {
        try {
            parser.parseMulti([testdir + "test11.edit", testdir + "test12.edit"]);
        } catch (e: unknown) {
            console.log(e);
            if (e instanceof Error) {
                expect(e.message).toBe(`checking errors (11).`); // these are checked in the previous test
                expect(checker.hasWarnings()).toBeTruthy;
                console.log("Warnings [" + checker.warnings.length +"]:" + checker.warnings.map(err => `"${err}"`).join("\n"));
                expect(checker.warnings.length).toBe(1);
                expect(checker.warnings.includes("Found multiple definitions for global projections, please note that they may be overridden [file: test11.edit:4:5],[file: test12.edit:4:5].")).toBeTruthy();
             }
        }
    });

    test("on external component definitions", () => {
        try {
            parser.parse(testdir + "test13.edit");
        } catch (e: unknown) {
            console.log(e);
            if (e instanceof Error) {
                console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                console.log("Warnings [" + checker.warnings.length +"]:" + checker.warnings.map(err => `"${err}"`).join("\n"));
                expect(e.message).toBe(`checking errors (11).`);
                expect(checker.hasWarnings()).toBeTruthy;
                expect(checker.warnings.length).toBe(1);
                expect(checker.warnings.includes("Found multiple definitions for global projections, please note that they may be overridden [file: test11.edit:4:5],[file: test12.edit:4:5].")).toBeTruthy();
            }
        }
    });
});
