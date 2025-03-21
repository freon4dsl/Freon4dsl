import {FreUtils} from "@freon4dsl/core";
import {FileHandler} from "../../utils/FileHandler";
import {
    ProductTest, TestParserExtra,
} from "../language/gen";
import {describe, test, expect, beforeEach} from "vitest";
import {TestParserExtraEnvironment} from "../config/gen/TestParserExtraEnvironment";

describe("Parser on extra elements", () => {
    const reader = TestParserExtraEnvironment.getInstance().reader;
    const writer = TestParserExtraEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test(" On lists of references to parts", () => {
        let input: string = fileHandler.stringFromFile("src/parser-extra-tests/__inputs__/test1.prod");
        let model = new TestParserExtra();
        model.name = "TestParserExtra12";
        const unit1: ProductTest = reader.readFromString(input, "ProductTest", model) as ProductTest;
        expect(unit1).not.toBe(null);
        expect(unit1).not.toBe(undefined);
        expect(unit1).toBeInstanceOf(ProductTest);
        console.log(writer.writeToString(unit1));
        // ServerCommunication.getInstance().putModelUnit(model.name, { name: unit1.name, id: unit1.freId() }, unit1);
        expect(unit1).toMatchSnapshot();
    });
});
