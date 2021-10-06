import { Graphviz_dotEnvironment } from "../environment/gen/Graphviz_dotEnvironment";
import { FileHandler } from "./FileHandler";

describe("Testing Graphviz Parser", () => {
    const writer = Graphviz_dotEnvironment.getInstance().writer;
    const reader = Graphviz_dotEnvironment.getInstance().reader;
    const fileHandler = new FileHandler();

    // TODO use snapshots
    test("on simple graph", () => {
        const input = fileHandler.stringFromFile("./src/graphviz/__inputs__/SimpleGraph.gra");
        const unit1 = reader.readFromString(input, "UmlPart");
        console.log(writer.writeToString(unit1));
    });

    // test("orders model unparsed and parsed again", () => {
    //     const input = fileHandler.stringFromFile("src/octopus/__tests__/orders.uml2");
    //     const unit1 = reader.readFromString(input, "UmlPart");
    //     console.log(writer.writeToString(unit1));
    // });
    //
    // test("catalog model unparsed and parsed again", () => {
    //     const input = fileHandler.stringFromFile("src/octopus/__tests__/catalog.uml2");
    //     const unit1 = reader.readFromString(input, "UmlPart");
    //     console.log(writer.writeToString(unit1));
    // });
    //
    // test("trainWagon model unparsed and parsed again", () => {
    //     const input = fileHandler.stringFromFile("src/octopus/__tests__/trainWagon.uml2");
    //     const unit1 = reader.readFromString(input, "UmlPart");
    //     console.log(writer.writeToString(unit1));
    // });
});
