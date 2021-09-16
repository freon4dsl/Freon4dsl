import { TestParserEnvironment } from "../environment/gen/TestParserEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { LimitedTest, PrimitivesTest } from "../language/gen";

describe("Test the parser", () => {
    const reader = TestParserEnvironment.getInstance().reader;
    const writer = TestParserEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " on Primitives ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-test/__inputs__/test1.pri");
            const unit1: PrimitivesTest = reader.readFromString(input, "PrimitivesTest") as PrimitivesTest;
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            expect(e).toBeNaN();
        }
    });

    test( " on Limited Concepts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-test/__inputs__/test1.lim");
            const unit1: LimitedTest = reader.readFromString(input, "LimitedTest") as LimitedTest;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            expect(e).toBeNaN();
        }
    });
});
