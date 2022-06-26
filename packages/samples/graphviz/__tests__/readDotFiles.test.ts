import { Graphviz_dotEnvironment } from "../environment/gen/Graphviz_dotEnvironment";
import { FileHandler } from "./FileHandler";
import { Xx } from "../language/gen";

describe("Testing Graphviz Parser", () => {
    const writer = Graphviz_dotEnvironment.getInstance().writer;
    const reader = Graphviz_dotEnvironment.getInstance().reader;
    const fileHandler = new FileHandler();

    // TODO use snapshots
    test.skip("on simple graph", () => {
        // skipped because the test does not terminate
        const input = fileHandler.stringFromFile("./src/graphviz/__inputs__/SimpleGraph.gra");
        const unit1 = reader.readFromString(input, "UmlPart", new Xx());
        console.log(writer.writeToString(unit1));
    });
});
