import { FREON, CoreConfig, FreUtils, ServerCommunication } from "@freon4dsl/core"
import { TestConceptsModelEnvironment } from "../../parser-basic-concepts/freon/config/TestConceptsModelEnvironment.js"
import {FileHandler} from "../../utils/FileHandler.js";
import {
    RefsTest,
    TestParserModel,
} from "../freon/language/index.js";
import {describe, test, expect, beforeEach} from "vitest";

describe("Parser properties of type", () => {
    CoreConfig.initialize(TestConceptsModelEnvironment.getInstance(), null)
    const reader = FREON.environment.reader;
    const writer = FREON.environment.writer;
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
        ServerCommunication.getInstance().saveModelUnit(model.name, { name: unit1.name, id: unit1.freId(), type: unit1.freId() }, unit1);
        expect(unit1).toMatchSnapshot();
    });
});
