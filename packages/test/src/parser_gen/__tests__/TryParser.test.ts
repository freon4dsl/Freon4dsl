import { DemoFileReader } from "../parser/gen/DemoFileReader";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { Demo, DemoUnit } from "../language/gen";

const demoParser = require("../parser/gen/DemoUnitUnitParser");

describe("Test the parser", () => {
    test( "XXX", () => {
        const reader = new DemoFileReader<DemoUnit>();
        reader.parser = demoParser;
        const unit1 = reader.parse("src/parser_gen/__tests__/ParserInput1.txt");
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
        const unit2 = reader.parse("src/parser_gen/__tests__/ParserInput1.txt");
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
        const myModels: DemoUnit[] = [];
        myModels.push(unit1);
        myModels.push(unit2);
        const model = Demo.create({ name: "SOME_MODEL", models: myModels });

        // resolve all references
        // const resolver = new DemoChecker();
        // let errors = resolver.check(unit);
        // for (let e of errors) {
        //     console.log(e.message + " in " + e.locationdescription);
        // }
        //
        const unparser = new DemoUnparser();
        let text = unparser.unparse(model, 0, false);
        expect(text.length).toBe(1104);
    });
});
