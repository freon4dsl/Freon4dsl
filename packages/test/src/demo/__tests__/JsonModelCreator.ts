import { PiElementReference } from "@projectit/core";
import { DemoEntity, DemoAttribute, DemoModel, DemoAttributeType, DemoFunction } from "../language/gen";

export class JsonModelCreator {
    model: DemoModel;

    constructor() {
        this.model = this.createCorrectModel();
    }

    public createCorrectModel(): DemoModel {
        let correctModel: DemoModel = DemoModel.create({name: "DemoModel_1"});

        const personEnt = DemoEntity.create({name: "Person"});
        const age = DemoAttribute.create({name: "age"});
        age.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // age.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        const personName = DemoAttribute.create({name: "name"});
        personName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // personName.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        personEnt.attributes.push(age);
        personEnt.attributes.push(personName);

        const companyEnt = DemoEntity.create({name: "Company"});
        const companyName = DemoAttribute.create({name: "name"});
        const VAT_Number = DemoAttribute.create({name: "VAT_Number"});
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);

        correctModel.entities.push(personEnt);
        correctModel.entities.push(companyEnt);

        const aFunction = DemoFunction.create({name: "SomeFunction", declaredType: PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType")});
        correctModel.functions.push(aFunction);

        return correctModel;
    }
}
