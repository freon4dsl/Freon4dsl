import { AST, FreNodeReference } from "@freon4dsl/core";
import { DemoEntity, DemoAttribute, DemoModel, DemoAttributeType, DemoFunction } from "../freon/language/gen/index.js";

export class JsonModelCreator {
    model: DemoModel;

    constructor() {
        this.model = this.createCorrectModel();
    }

    public createCorrectModel(): DemoModel {
        let correctModel
        AST.change( () => {
            correctModel = DemoModel.create({ name: "DemoModel_1" });

            const personEnt = DemoEntity.create({ name: "Person" });
            const age = DemoAttribute.create({ name: "age" });
            age.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
            // age.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
            const personName = DemoAttribute.create({ name: "name" });
            personName.declaredType = FreNodeReference.create<DemoAttributeType>(
                DemoAttributeType.String,
                "DemoAttributeType",
            );
            // personName.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);

            const companyEnt = DemoEntity.create({ name: "Company" });
            const companyName = DemoAttribute.create({ name: "name" });
            const VAT_Number = DemoAttribute.create({ name: "VAT_Number" });
            companyEnt.attributes.push(companyName);
            companyEnt.attributes.push(VAT_Number);

            correctModel.entities.push(personEnt);
            correctModel.entities.push(companyEnt);

            const aFunction = DemoFunction.create({
                name: "SomeFunction",
                declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType"),
            });
            correctModel.functions.push(aFunction);
        })
        return correctModel!;
    }
}
