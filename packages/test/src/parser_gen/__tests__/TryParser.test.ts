import { Demo, DemoUnit } from "../language/gen";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";

describe("Test the parser", () => {
    test( "XXX", () => {
        const reader = DemoEnvironment.getInstance().reader;
        const writer = DemoEnvironment.getInstance().writer;
        const unit1: DemoUnit = reader.readFromFile("src/parser_gen/__tests__/ParserInput1.txt", "DemoUnit") as DemoUnit;
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
        const unit2 = reader.readFromFile("src/parser_gen/__tests__/ParserInput1.txt", "DemoUnit") as DemoUnit;
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
        let text = writer.writeToString(model, 0, false);
        // TODO use snapshot
        expect(text.length).toBe(1104);
    });
});
