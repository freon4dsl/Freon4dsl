import { FreUtils } from "@projectit/core";
import { FileHandler } from "../../utils/FileHandler";
import { ParserOnConceptsEnvironment } from "../config/gen/ParserOnConceptsEnvironment";
import { ExpressionTest, TestConceptsModel } from "../language/gen";

describe("Parser concepts of type", () => {
    const reader = ParserOnConceptsEnvironment.getInstance().reader;
    const writer = ParserOnConceptsEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    beforeEach(() => {
        // Ensure that ID's of created elements do not change.
        FreUtils.resetId();
    });

    test( " Expression ", () => {
        try {
            const input = fileHandler.stringFromFile("src/parser-basic-concepts/__inputs__/test1.exp");
            const unit1: ExpressionTest = reader.readFromString(input, "ExpressionTest", new TestConceptsModel()) as ExpressionTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

});
