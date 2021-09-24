import { FileHandler } from "../../utils/FileHandler";
import { ParserOnConceptsEnvironment } from "../environment/gen/ParserOnConceptsEnvironment";
import { ExpressionTest } from "../language/gen";

describe("Parser concepts of type", () => {
    const reader = ParserOnConceptsEnvironment.getInstance().reader;
    const writer = ParserOnConceptsEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " Expression ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-concepts/__inputs__/test1.exp");
            const unit1: ExpressionTest = reader.readFromString(input, "ExpressionTest") as ExpressionTest;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

});
