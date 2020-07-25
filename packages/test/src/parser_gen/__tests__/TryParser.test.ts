import { TryParser } from "../unparser/TryParser";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { DemoUnit } from "../language/gen";
let demoParser = require("../unparser/gen/DemoParserGeneratorInput");

describe("Probeer de parser", () => {
    test( "XXX", () => {
        const parser = new TryParser<DemoUnit>();
        parser.parser = demoParser;
        let unit = parser.parse("src/parser_gen/__tests__/ParserInput1.txt");
        //
        const unparser = new DemoUnparser();
        console.log(unparser.unparse(unit, false));
    });
});
