import { PiLanguageEnvironment } from "../environment/gen/PiLanguageEnvironment";
import { FileHandler } from "./FileHandler";
import { PiStructureDef } from "../language/gen";

describe("Pi Language Parser", () => {
    const reader = PiLanguageEnvironment.getInstance().reader;
    const writer = PiLanguageEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " on .ast file", () => {
        try {
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.ast");
            const unit1: PiStructureDef = reader.readFromString(input, "PiStructureDef") as PiStructureDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

});
