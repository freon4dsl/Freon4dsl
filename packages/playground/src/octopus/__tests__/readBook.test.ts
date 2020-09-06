import { OctopusParser } from "../parser/gen/OctopusParser";
import { UmlPart } from "../language/gen";
import { OctopusEnvironment } from "../environment/gen/OctopusEnvironment";

const umlParser = require("../parser/gen/UmlPartUnitParser");

describe("Testing Parser", () => {
    test("book model unparsed and parsed again", () => {
        const unparser = OctopusEnvironment.getInstance().unparser;
        const parser = new OctopusParser<UmlPart>();
        parser.parser = umlParser;
        const unit1 = parser.parse("src/octopus/__tests__/Book.uml2");
        //
        // unit1.packages.forEach(pack => pack.classifiers.forEach(cls => {
        //     // console.log("CLassifier " + cls.name + " has visibility " + cls.visibility.name + ", " + cls.visibility.referred?.name);
        // }) );
        //

        console.log(unparser.unparse(unit1, 0, false));
    });
});
