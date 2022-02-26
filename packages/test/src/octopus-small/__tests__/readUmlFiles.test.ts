import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions";
import { OctopusModel } from "../language/gen";

const writer = OctopusEnvironment.getInstance().writer;
const reader = OctopusEnvironment.getInstance().reader;

describe("Testing Parser", () => {
    // TODO use snapshots
    test("book unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model,"src/octopus-small/__inputs__/Book.uml2", "UmlPart");
    });

    test("orders model unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model,"src/octopus-small/__inputs__/orders.uml2", "UmlPart");
    });

    test("catalog model unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model,"src/octopus-small/__inputs__/catalog.uml2", "UmlPart");
    });

    test("trainWagon model unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model,"src/octopus-small/__inputs__/trainWagon.uml2", "UmlPart");
    });
});
