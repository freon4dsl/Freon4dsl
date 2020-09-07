import { OctopusFileReader } from "../parser/gen/OctopusFileReader";
import { UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";

const umlParser = require("../parser/gen/UmlPartUnitParser");

describe("Testing Parser", () => {
    const unparser = OctopusEnvironment.getInstance().unparser;
    const parser = new OctopusFileReader<UmlPart>();
    parser.parser = umlParser;
    // TODO use snapshots
    test("book model unparsed and parsed again", () => {
        const unit1 = parser.parse("src/octopus/__tests__/Book.uml2");
        console.log(unparser.unparse(unit1, 0, false));
    });

    test("orders model unparsed and parsed again", () => {
        const unit1 = parser.parse("src/octopus/__tests__/orders.uml2");
        console.log(unparser.unparse(unit1, 0, false));
    });

    test("catalog model unparsed and parsed again", () => {
        const unit1 = parser.parse("src/octopus/__tests__/catalog.uml2");
        console.log(unparser.unparse(unit1, 0, false));
    });

    test("trainWagon model unparsed and parsed again", () => {
        const unit1 = parser.parse("src/octopus/__tests__/trainWagon.uml2");
        console.log(unparser.unparse(unit1, 0, false));
    });
});
