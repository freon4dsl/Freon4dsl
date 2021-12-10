import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import { FileHandler } from "./FileHandler";

describe("Testing Parser for OCl part", () => {
    const writer = OctopusEnvironment.getInstance().writer;
    const reader = OctopusEnvironment.getInstance().reader;
    const fileHandler = new FileHandler();

    // TODO use snapshots
    test("Period unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus/__inputs__/Period.ocl");
        const unit1 = reader.readFromString(input, "OclPart");
        console.log(writer.writeToString(unit1, 0, false));
    });
});
