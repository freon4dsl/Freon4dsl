import {FreUtils, ServerCommunication} from "@freon4dsl/core";
import {TestParserModelEnvironment} from "../freon/config/TestParserModelEnvironment";
import {FileHandler} from "../../utils/FileHandler";
import {
    LimitedTest,
    PartsTest,
    PrimitivesTest,
    RefsTest,
    PrimsWithKeywordTest,
    TestParserModel,
} from "../freon/language";
import {describe, it, test, expect, beforeEach} from "vitest";

describe("Parser properties of type", () => {
    const reader = TestParserModelEnvironment.getInstance().reader;
    const writer = TestParserModelEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test.skip(" Ref on small input", () => {
        let input: string = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test3.ref");
        let model = new TestParserModel();
        model.name = "TestParserModel-new";
        const unit1: RefsTest = reader.readFromString(input, "RefsTest", model) as RefsTest;
        // console.log(writer.writeToString(unit1));
        ServerCommunication.getInstance().saveModelUnit(model.name, { name: unit1.name, id: unit1.freId() }, unit1);
        expect(unit1).toMatchSnapshot();
    });
});
