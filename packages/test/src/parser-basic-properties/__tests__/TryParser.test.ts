import { FreUtils } from "@freon4dsl/core";
import { TestParserModelEnvironment } from "../config/gen/TestParserModelEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import {
    LimitedTest,
    PartsTest,
    PrimitivesTest,
    RefsTest,
    PrimsWithKeywordTest,
    TestParserModel,
} from "../language/gen";
import { describe, it, test, expect, beforeEach } from "vitest";

describe("Parser properties of type", () => {
    const reader = TestParserModelEnvironment.getInstance().reader;
    const writer = TestParserModelEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test(" Primitive ", () => {
        let unit1: PrimitivesTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.pri");
             unit1 = reader.readFromString(
                input,
                "PrimitivesTest",
                new TestParserModel(),
                 "src/parser-basic-properties/__inputs__/test1.pri"
            ) as PrimitivesTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test1.pri-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Primitive with Keyword projection ", () => {
        let unit1: PrimsWithKeywordTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.wit");
            unit1  = reader.readFromString(
                input,
                "PrimsWithKeywordTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test1.wit"
            ) as PrimsWithKeywordTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test1.wit-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Limited Concept ", () => {
        let unit1: LimitedTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.lim");
            unit1 = reader.readFromString(
                input,
                "LimitedTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test1.lim"
            ) as LimitedTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test1.lim-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part ", () => {
        let unit1: PartsTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.par");
            unit1 = reader.readFromString(
                input,
                "PartsTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test1.par"
            ) as PartsTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test1.par-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part with Optionals present", () => {
        let unit1: PartsTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test3.par");
            unit1= reader.readFromString(
                input,
                "PartsTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test3.par"
            ) as PartsTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test3.par-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part and Sub Parts ", () => {
        let unit1: PartsTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.par");
            unit1= reader.readFromString(
                input,
                "PartsTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test2.par"
            ) as PartsTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test2.par-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Ref ", () => {
        let unit1: RefsTest = undefined;
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.ref");
            unit1 = reader.readFromString(input, "RefsTest", new TestParserModel()) as RefsTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test1.ref-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Ref with Optionals present", () => {
        let unit1: RefsTest = undefined;
        try {
            let input: string = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.ref");
            unit1 = reader.readFromString(
                input,
                "RefsTest",
                new TestParserModel(),
                "src/parser-basic-properties/__inputs__/test2.ref"
            ) as RefsTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect(unit1).not.toBeUndefined();
        // fileHandler.stringToFile("src/parser-basic-properties/__inputs__/test2.ref-out", writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });
});
