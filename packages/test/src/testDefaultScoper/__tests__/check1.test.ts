import { DSmodel } from "../language/gen";
import { ModelCreator } from "./ModelCreator";
import { DefaultScoperTestScoper } from "../scoper/gen";
import { DefaultScoperTestUnparser } from "../unparser/gen/DefaultScoperTestUnparser";

function print(prefix: string, visibleNames: string[]) {
    let printable: string = "";
    for (let name of visibleNames) {
        printable += "\n\t" + name + ",";
    }
    console.log(prefix + ": " + printable);
}

describe("Testing Default Scoper", () => {
    const scoper = new DefaultScoperTestScoper();
    const unparser = new DefaultScoperTestUnparser();

    test("model with 1 unit of depth 2", () => {
        const creator = new ModelCreator();
        let model: DSmodel = creator.createModel(1,2);
        let visibleNames = scoper.getVisibleNames(model);
        // print("FOUND", visibleNames);
        // print("AllNames", creator.allNames);

        // let diff: string[] = [];
        // for (let yy of creator.allNames) {
        //     if (!visibleNames.includes(yy)) diff.push(yy);
        // }
        // if (diff.length > 0) print("Difference", diff);

        for (let x of creator.allNames) {
            expect(visibleNames).toContain(x);
        }
    });
});

