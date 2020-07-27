import { DemoParser } from "../parser/gen/DemoParser";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { DemoUnit } from "../language/gen";
let demoParser = require("../parser/gen/DemoUnitUnitParser");

describe("Probeer de parser", () => {
    test( "XXX", () => {
        const parser = new DemoParser<DemoUnit>();
        parser.parser = demoParser;
        let unit = parser.parse("src/parser_gen/__tests__/ParserInput1.txt");
        //
        const unparser = new DemoUnparser();
        console.log(unparser.unparse(unit, false));
    });
});
