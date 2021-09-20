import { UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import { FileHandler } from "./FileHandler";

describe("Testing Parser", () => {
    const writer = OctopusEnvironment.getInstance().writer;
    const reader = OctopusEnvironment.getInstance().reader;
    const fileHandler = new FileHandler();

    // TODO use snapshots
    test("book model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus/__tests__/Book-small.uml2");
        const unit1 = reader.readFromString(input, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("orders model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus/__tests__/orders.uml2");
        const unit1 = reader.readFromString(input, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("catalog model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus/__tests__/catalog.uml2");
        const unit1 = reader.readFromString(input, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("trainWagon model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus/__tests__/trainWagon.uml2");
        const unit1 = reader.readFromString(input, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("book model STRING unparsed and parsed again", () => {
        const langSpec = fileHandler.stringFromFile("src/octopus/__tests__/orders.uml2");
        const unit1 = reader.readFromString(langSpec, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });
});
