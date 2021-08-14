import { DemoModelCreator } from "./DemoModelCreator";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";
import { DemoModel } from "../language/gen";
import { FileHandler } from "../../utils/FileHandler";

describe("Testing Parser", () => {
    test("complete example model unparsed and parsed again", () => {
        const model = new DemoModelCreator().createCorrectModel();
        const unparser = DemoEnvironment.getInstance().writer;
        const parser = DemoEnvironment.getInstance().reader;
        const validator = DemoEnvironment.getInstance().validator;

        // first do a check on the input model
        expect(model.models.length).toBeGreaterThan(0);
        model.models.forEach(ent => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });

        const errors = validator.validate(model);
        for (const e of errors) {
            console.log(e.message + " => " + e.locationdescription);
        }
        // do not unparse if there are errors
        if (errors.length > 4) { // the custom validator adds 4 unneccessary errors
            const path: string = "./unparsedDemoModel1.txt";
            const fileHandler = new FileHandler();

            // unparse the first unit to a string and write it to File
            fileHandler.stringToFile(path, unparser.writeToString(model.models[0], 0));
            // read it back in
            const unit1 = parser.readFromString(fileHandler.stringFromFile(path), "DemoModel") as DemoModel;

            // compare the read unit with the original
            expect(model.models[0].name).toBe(unit1.name);
            model.models[0].entities.forEach(ent => {
                const foundEntity = unit1.entities.find(uEnt => uEnt.name === ent.name);
                expect(foundEntity).not.toBeNull();
                ent.attributes.forEach(modelAttr => {
                    expect(foundEntity.attributes).toContain(modelAttr);
                });
            });
            model.models[0].functions.forEach(ent => {
                const foundEntity = unit1.functions.find(uEnt => uEnt.name === ent.name);
                expect(foundEntity).not.toBeNull();
                ent.parameters.forEach(modelAttr => {
                    expect(foundEntity.parameters).toContain(modelAttr);
                });
            });
            // TODO add more comparisons to the test???
        }
    });
});
