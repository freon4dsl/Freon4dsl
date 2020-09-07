import { OctopusFileReader } from "../parser/gen/OctopusFileReader";
import { UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";

const umlParser = require("../parser/gen/UmlPartUnitParser");

describe("Testing Parser", () => {
    test("book model unparsed and parsed again", () => {
        const unparser = OctopusEnvironment.getInstance().unparser;
        const parser = new OctopusFileReader<UmlPart>();
        // parser.parser = umlParser;
        const unit1 = parser.parse("src/octopus/__tests__/Book.uml2");
        //
        // unit1.packages.forEach(pack => pack.classifiers.forEach(cls => {
        //     if (cls.name === "Chapter") {
        //         cls.operations.forEach(op => op.parameters.forEach(param => console.log(param.directionKind.name)));
        //     }
        // }) );
        //

        console.log(unparser.unparse(unit1, 0, false));
    });
});
