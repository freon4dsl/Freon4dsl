import { Demo, DemoUnit } from "../language/gen";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";
import { FileHandler } from "../../utils/FileHandler";

describe("Test the parser", () => {
    test( ": read two units and create a model", () => {
        const reader = DemoEnvironment.getInstance().reader;
        const writer = DemoEnvironment.getInstance().writer;
        const fileHandler = new FileHandler();

        let input = fileHandler.stringFromFile("src/parser_gen/__tests__/ParserInput1.txt");
        const unit1: DemoUnit = reader.readFromString(input, "DemoUnit") as DemoUnit;

        unit1.main?.baseEntity.forEach(ent => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });
        unit1.main?.attributes.forEach(attr => {
            expect(attr.declaredType).not.toBeUndefined();
            expect(attr.declaredType).not.toBeNull();
        });

        input = fileHandler.stringFromFile("src/parser_gen/__tests__/ParserInput2.txt");
        const unit2: DemoUnit = reader.readFromString(input, "DemoUnit") as DemoUnit;
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

        let output = writer.writeToString(model, 0, false);
        fileHandler.stringToFile("src/parser_gen/__tests__/ParserOutput.txt", output);
        expect(output).toMatchSnapshot();
    });
});
