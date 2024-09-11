import { FileHandler } from "../../utils/FileHandler";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { Demo, ExModel } from "../language/gen";
import { describe, test, expect } from "vitest";

describe("Test the STUB that replaces the parser", () => {
    test(": read a unit", () => {
        const reader = DemoEnvironment.getInstance().reader;
        const fileHandler = new FileHandler();

        let unit1: ExModel = null;
        try {
            let input = fileHandler.stringFromFile("src/testNoParserAvailable/__tests__/LargeUnit.exm");
            unit1 = reader.readFromString(input, "ExModel", new Demo()) as ExModel;
        } catch (e) {
            expect(e.message).toBe("Not able to read ExModel, no parser available.");
        }
        expect(unit1).toBeNull();
    });
});
