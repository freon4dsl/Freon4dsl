import { DemoModelCreator } from "./DemoModelCreator";
import * as fs from "fs";
import { DemoParser } from "../parser/gen/DemoParser";
import { DemoModel } from "../language/gen";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { DemoUnit } from "../../parser_gen/language/gen";
import { DemoValidator } from "../validator/gen";

var demoParser = require("../parser/gen/DemoModelUnitParser");

describe("Testing Parser", () => {
    // TODO finish the following test after validator includes check on non-optional parts
    test("complete example model unparsed and parsed again", () => {
        const model = new DemoModelCreator().createCorrectModel();
        const unparser = new DemoUnparser();
        const parser = new DemoParser<DemoUnit>();
        parser.parser = demoParser;
        const validator = new DemoValidator();

        // first do a check on the input model
        expect(model.models.length).toBeGreaterThan(0);
        model.models.forEach(ent => {
            expect(ent).not.toBeUndefined();
            expect(ent).not.toBeNull();
        });

        const errors = validator.validate(model);
        for (let e of errors) {
            console.log(e.message +"=>"+ e.locationdescription);
        }
        // do not unparse if there are errors
        if (errors.length == 0) {
            // unparse the first unit to a string
            let unit1_unparsed: string = unparser.unparse(model.models[0], 0, false);
            let path: string = "./unparsedDemoModel1.txt";
            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, unit1_unparsed);
            } else {
                console.log(this, "projectit-test-unparser: user file " + path + " already exists, skipping it.");
            }
            let unit1 = parser.parse(path);
        }
    });
});
