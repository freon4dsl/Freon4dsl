import { DemoParser } from "../parser/gen/DemoParser";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { Demo, DemoUnit } from "../language/gen";

var demoParser = require("../parser/gen/DemoUnitUnitParser");

describe("Probeer de parser", () => {
    test( "XXX", () => {
        const parser = new DemoParser<DemoUnit>();
        parser.parser = demoParser;
        let unit1 = parser.parse("src/parser_gen/__tests__/ParserInput1.txt");
        //
        unit1.main?.baseEntity.forEach(ent => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });
        unit1.main?.attributes.forEach(attr => {
            expect(attr.declaredType).not.toBeUndefined();
            expect(attr.declaredType).not.toBeNull();
        });
        //
        let unit2 = parser.parse("src/parser_gen/__tests__/ParserInput1.txt");
        //
        unit2.main?.baseEntity.forEach(ent => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });
        unit2.main?.attributes.forEach(attr => {
            expect(attr.declaredType).not.toBeUndefined();
            expect(attr.declaredType).not.toBeNull();
        });
        //
        let myModels: DemoUnit[] = [];
        myModels.push(unit1);
        myModels.push(unit2);
        let model = Demo.create({name: "ANNEKE_IS_LIEF", models: myModels});

        // resolve all references
        // const resolver = new DemoChecker();
        // let errors = resolver.check(unit);
        // for (let e of errors) {
        //     console.log(e.message + " in " + e.locationdescription);
        // }
        //
        const unparser = new DemoUnparser();
        console.log(unparser.unparse(model, 0,false));
    });
});
