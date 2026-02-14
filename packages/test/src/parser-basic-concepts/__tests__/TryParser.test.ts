import { FREON, CoreConfig, FreUtils } from "@freon4dsl/core"
import { FileHandler } from "../../utils/FileHandler.js";
import { TestConceptsModelEnvironment } from "../freon/config/TestConceptsModelEnvironment.js";
import { ExpressionTest, TestConceptsModel } from "../freon/language/index.js";
import { describe, it, test, expect, beforeEach } from "vitest";

describe("Parser concepts of type", () => {
    CoreConfig.initialize(TestConceptsModelEnvironment.getInstance(), null)
    const reader = FREON.environment.reader;
    const writer = FREON.environment.writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test(" Expression ", () => {
        const input = fileHandler.stringFromFile("src/parser-basic-concepts/__inputs__/test1.exp");
        let unit1 = reader.readFromString(
            input,
            "ExpressionTest",
            new TestConceptsModel(),
        ) as ExpressionTest;
        // console.log(writer.writeToString(unit1, 0, false));
        expect(unit1).toMatchSnapshot();
    });
});
