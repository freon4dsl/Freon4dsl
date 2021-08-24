import { FileHandler } from "../../utils/FileHandler";
import { ExampleEnvironment } from "../environment/gen/ExampleEnvironment";
import { ExModel } from "../language/gen";

describe("Test the STUB that replaces the parser", () => {
    test( ": read a unit", () => {
        const reader = ExampleEnvironment.getInstance().reader;
        const fileHandler = new FileHandler();

        let unit1: ExModel = null;
        try {
            let input = fileHandler.stringFromFile("src/testNoParserAvailable/__tests__/LargeUnit.exm");
            unit1 = reader.readFromString(input, "ExModel") as ExModel;
        } catch (e) {
            expect(e.message).toBe("Not able to read ExampleModelUnitType, no parser(s) available.")
        }

        expect(unit1).toBeNull();
    });
});
