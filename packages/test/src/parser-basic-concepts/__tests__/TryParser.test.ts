import { AST, FreUtils } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import { TestConceptsModelEnvironment } from "../config/gen/TestConceptsModelEnvironment";
import { ExpressionTest, TestConceptsModel } from "../language/gen";
import { describe, it, test, expect, beforeEach } from "vitest";

describe("Parser concepts of type", () => {
    const reader = TestConceptsModelEnvironment.getInstance().reader;
    const writer = TestConceptsModelEnvironment.getInstance().writer;
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
