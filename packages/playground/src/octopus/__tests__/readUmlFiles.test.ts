import { UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import * as fs from "fs";

describe("Testing Parser", () => {
    const writer = OctopusEnvironment.getInstance().writer;
    const reader = OctopusEnvironment.getInstance().reader;
    // const piReader = new OctopusFileReader<UmlPart>();
    // piReader.piReader = umlParser;
    // TODO use snapshots
    test("book model unparsed and parsed again", () => {
        const unit1 = reader.readFromFile("src/octopus/__tests__/Book.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("orders model unparsed and parsed again", () => {
        const unit1 = reader.readFromFile("src/octopus/__tests__/orders.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("catalog model unparsed and parsed again", () => {
        const unit1 = reader.readFromFile("src/octopus/__tests__/catalog.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("trainWagon model unparsed and parsed again", () => {
        const unit1 = reader.readFromFile("src/octopus/__tests__/trainWagon.uml2", "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });

    test("book model STRING unparsed and parsed again", () => {
        const langSpec: string = fs.readFileSync("src/octopus/__tests__/orders.uml2", { encoding: "UTF8" });
        const unit1 = reader.readFromString(langSpec, "UmlPart");
        console.log(writer.writeToString(unit1, 0, false));
    });
});
