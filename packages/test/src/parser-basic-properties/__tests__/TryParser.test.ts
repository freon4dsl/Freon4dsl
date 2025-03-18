import { AST, FreUtils } from "@freon4dsl/core";
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
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.pri");
            AST.change( () => {
                const unit1: PrimitivesTest = reader.readFromString(
                    input,
                    "PrimitivesTest",
                    new TestParserModel(),
                ) as PrimitivesTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Primitive with Keyword projection ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.wit");
            AST.change( () => {
                const unit1: PrimsWithKeywordTest = reader.readFromString(
                    input,
                    "PrimsWithKeywordTest",
                    new TestParserModel(),
                ) as PrimsWithKeywordTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Limited Concept ", () => {
        // TODO not correct: line 14 of input not handled as it should
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.lim");
            AST.change( () => {
                const unit1: LimitedTest = reader.readFromString(
                    input,
                    "LimitedTest",
                    new TestParserModel(),
                ) as LimitedTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Part ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.par");
            AST.change( () => {
                const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Part with Optionals present", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test3.par");
            AST.change( () => {
                const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Part and Sub Parts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.par");
            AST.change( () => {
                const unit1: PartsTest = reader.readFromString(input, "PartsTest", new TestParserModel()) as PartsTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Ref ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.ref");
            AST.change( () => {
                const unit1: RefsTest = reader.readFromString(input, "RefsTest", new TestParserModel()) as RefsTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test(" Ref with Optionals present", () => {
        try {
            let input: string = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.ref");
            AST.change( () => {
                const unit1: RefsTest = reader.readFromString(input, "RefsTest", new TestParserModel()) as RefsTest;
                console.log(writer.writeToString(unit1));
                expect(unit1).toMatchSnapshot();
            })
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });
});
