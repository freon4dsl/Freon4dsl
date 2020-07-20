import { GenericModelSerializer } from "@projectit/core";
import { Demo } from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";

export class DemoUnitCreator {
    serializer: GenericModelSerializer = new GenericModelSerializer();

    modelToJsonToModel() : Demo {
        let result : Demo = Demo.create({name: "ReadFromJson"});
        const model = new DemoModelCreator().createModelWithMultipleUnits();
        // convert first unit as complete unit
        let unit1Json = this.serializer.convertToJSON(model.models[0], false);
        // convert second unit as public interface
        let unit2Json = this.serializer.convertToJSON(model.models[1], true);
        result.models.push(this.serializer.toTypeScriptInstance(unit1Json));
        result.models.push(this.serializer.toTypeScriptInstance(unit2Json));
        return result;
    }
}
