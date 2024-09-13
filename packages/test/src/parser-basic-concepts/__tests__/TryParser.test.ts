import { FreUtils } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import { TestConceptsModelEnvironment } from "../config/gen/TestConceptsModelEnvironment";
import { ExpressionTest, TestConceptsModel } from "../language/gen";
import { describe, test, expect, beforeEach } from "vitest";

describe("Parser concepts of type", () => {
    const reader = TestConceptsModelEnvironment.getInstance().reader;
    const writer = TestConceptsModelEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test(" Expression ", () => {
        let unit1: ExpressionTest = undefined;
        try {
            const input = fileHandler.stringFromFile("src/parser-basic-concepts/__inputs__/test1.exp");
            unit1 = reader.readFromString(
                input,
                "ExpressionTest",
                new TestConceptsModel(),
                "src/parser-basic-concepts/__inputs__/test1.exp"
            ) as ExpressionTest;
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
        expect (unit1).not.toBeUndefined();
        // console.log(writer.writeToString(unit1, 0, false));
        expect(unit1).toMatchSnapshot();
    });
});
