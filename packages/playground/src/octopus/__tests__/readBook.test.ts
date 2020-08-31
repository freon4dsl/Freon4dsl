import { OctopusParser } from "../parser/gen/OctopusParser";
import { UmlPart } from "../language/gen";
import { OctopusUnparser } from "../unparser/gen/OctopusUnparser";

const umlParser = require("../parser/gen/UmlPartUnitParser");

describe("Testing Parser", () => {
    test("book model unparsed and parsed again", () => {
        const parser = new OctopusParser<UmlPart>();
        parser.parser = umlParser;
        const unit1 = parser.parse("src/octopus/__tests__/Book.uml2");
        //
        const unparser = new OctopusUnparser();
        console.log(unparser.unparse(unit1, 0, false));
    });
});
