import {FreUtils} from "@freon4dsl/core";
import {TestParserModelEnvironment} from "../freon/config/TestParserModelEnvironment";
import {FileHandler} from "../../utils/FileHandler";
import {
    LimitedTest,
    PartsTest,
    PrimitivesTest,
    RefsTest,
    PrimsWithKeywordTest,
    TestParserModel, OptionalPrimitivesTest
} from '../freon/language';
import {describe, it, test, expect, beforeEach} from "vitest";

describe("Parser properties of type", () => {
    const reader = TestParserModelEnvironment.getInstance().reader;
    const writer = TestParserModelEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test(" Primitive ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.pri");
        const unit1: PrimitivesTest = reader.readFromString(
            input,
            "PrimitivesTest",
            new TestParserModel(),
        ) as PrimitivesTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Optional Primitives ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test4.opt");
        const unit1: OptionalPrimitivesTest = reader.readFromString(
          input,
          "OptionalPrimitivesTest",
          new TestParserModel(),
          "test4.opt"
        ) as OptionalPrimitivesTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Primitive with Keyword projection ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.wit");
        const unit1: PrimsWithKeywordTest = reader.readFromString(
            input,
            "PrimsWithKeywordTest",
            new TestParserModel(),
        ) as PrimsWithKeywordTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Limited Concept ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.lim");
        const unit1: LimitedTest = reader.readFromString(
            input,
            "LimitedTest",
            new TestParserModel(),
        ) as LimitedTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.par");
        const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part with Optionals present", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test3.par");
        const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Part and Sub Parts ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.par");
        const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test(" Ref ", () => {
        let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.ref");
        const unit1: RefsTest = reader.readFromString(input, "RefsTest", new TestParserModel()) as RefsTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });

    test.skip(" Ref with Optionals present", () => {
        let input: string = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.ref");
        const unit1: RefsTest = reader.readFromString(input, "RefsTest", new TestParserModel()) as RefsTest;
        // console.log(writer.writeToString(unit1));
        expect(unit1).toMatchSnapshot();
    });
});
