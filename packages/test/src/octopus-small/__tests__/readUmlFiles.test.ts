import { UmlPackage } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import { FileHandler } from "../../utils/FileHandler";

describe("Testing Parser", () => {
    const writer = OctopusEnvironment.getInstance().writer;
    const reader = OctopusEnvironment.getInstance().reader;
    const fileHandler = new FileHandler();

    // TODO use snapshots
    test("book small", () => {
        const input = fileHandler.stringFromFile("src/octopus-small/__inputs__/Book-small.uml2");
        const unit1 = reader.readFromString(input, "UmlPackage");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("orders model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus-small/__inputs__/orders.uml2");
        const unit1 = reader.readFromString(input, "UmlPackage");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("catalog model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus-small/__inputs__/catalog.uml2");
        const unit1 = reader.readFromString(input, "UmlPackage");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("trainWagon model unparsed and parsed again", () => {
        const input = fileHandler.stringFromFile("src/octopus-small/__inputs__/trainWagon.uml2");
        const unit1 = reader.readFromString(input, "UmlPackage");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("book model STRING unparsed and parsed again", () => {
        const langSpec = fileHandler.stringFromFile("src/octopus-small/__inputs__/orders.uml2");
        const unit1 = reader.readFromString(langSpec, "UmlPackage");
        console.log(writer.writeToString(unit1, 0, false));
    });
});
