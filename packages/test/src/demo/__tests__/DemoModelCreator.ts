import {
    PiElementReference,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    DemoVariableRef,
    DemoIfExpression,
    DemoComparisonExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoStringLiteralExpression,
    DemoAndExpression,
    DemoPlusExpression,
    DemoModel,
    DemoAttributeType,
    DemoExpression,
    DemoBinaryExpression,
    DemoLessThenExpression,
    DemoMultiplyExpression,
    DemoDivideExpression,
    DemoBooleanLiteralExpression,
    DemoGreaterThenExpression,
    DemoEqualsExpression,
    DemoLiteralExpression,
    AppliedFeature, DemoAttributeRef, DemoAttributeWithEntityType, Demo
} from "../language/gen";
import { MakeDivideExp, MakeEqualsExp, MakeLessThenExp, makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";

export class DemoModelCreator {

    public createModelWithMultipleUnits(): Demo {
        let model: Demo = Demo.create({name: "ModelWithUnits"});
        model.models.push(this.createInheritanceUnit());
        model.models.push(this.createCorrectUnit());
        return model;
    }

    public createModelWithIsUniqueError(): Demo {
        let result = this.createCorrectModel();
        let unit: DemoModel = result.models.find(m => m.name === "CorrectUnit");

        const companyEnt = DemoEntity.create({name: "Company"}); // another one with the same unitName
        const VAT_Number = DemoAttribute.create({name: "VAT_Number"});
        const VAT_Number2 = DemoAttribute.create({name: "VAT_Number"});
        companyEnt.attributes.push(VAT_Number2);
        companyEnt.attributes.push(VAT_Number);
        unit.entities.push(companyEnt);

        const ifFunction = DemoFunction.create({name: "compare"});
        ifFunction.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("4", "80"); //("<")
        ifExpression.whenTrue = makeLiteralExp("87");
        ifExpression.whenFalse = makeLiteralExp("1345");
        const divideExpression = MakeDivideExp("678", "9990");

        companyEnt.functions.push(ifFunction);

        const double = DemoFunction.create({name: "compare"}); // another one with the same unitName
        const extra = DemoVariable.create({name: "Extra"});
        const extra2 = DemoVariable.create({name: "Extra"});
        double.parameters.push(extra);
        double.parameters.push(extra2);
        double.expression = MakePlusExp("24", "2020");
        // compare(Extra, Extra) = "24" + "2020"

        unit.functions.push(double);
        return result;
    }

    // model.functions[0].expression.appliedfeature.type.referred.unitName).toBe("Company")
    public createModelWithAppliedfeature(): Demo {
        let result = this.createIncorrectModel();
        let unit: DemoModel = result.models.find(m => m.name === "DemoModel_1");
        // add new attribute to Person entity
        let personent = unit.entities[0]; // Person
        let personattr = new DemoAttributeWithEntityType();
        personattr.name = "attrFromPerson";
        personattr.declaredType = PiElementReference.create<DemoEntity>(unit.entities[1], "DemoEntity"); // Company
        personent.entAttributes.push(personattr);

        // add new attribute to Company entity
        let companyent = unit.entities[1]; // Company
        let compattr = new DemoAttributeWithEntityType();
        compattr.name = "attrFromCompany";
        compattr.declaredType = PiElementReference.create<DemoEntity>(unit.entities[0], "DemoEntity"); // Person
        companyent.entAttributes.push(compattr);

        // find the function to be changed
        let length = unit.functions[0];

        // create an expression that includes applied features
        let expression: DemoVariableRef = new DemoVariableRef();
        expression.variable = PiElementReference.create<DemoVariable>(length.parameters[0], "DemoVariable"); // Variable1: Person
        // add an applied feature to the variable reference
        let firstFeature: DemoAttributeRef = new DemoAttributeRef();
        firstFeature.attribute = PiElementReference.create<DemoAttributeWithEntityType>(personattr, "DemoAttributeWithEntityType"); // Person.attrFromPerson: Company
        expression.appliedfeature = firstFeature;
        // add a second applied feature to the attribute reference
        let secondFeature: DemoAttributeRef = new DemoAttributeRef();
        secondFeature.attribute = PiElementReference.create<DemoAttributeWithEntityType>(compattr, "DemoAttributeWithEntityType"); // Company.attrFromCompany: Person
        firstFeature.appliedfeature = secondFeature;

        // change the expression of function model.length to the newly created expression

        length.expression = expression;
        return result;
    }

    public createInheritanceModel(): Demo {
        let model: Demo = Demo.create({name: "ModelWithInheritance"});
        let inheritanceModel = this.createInheritanceUnit();
        model.models.push(inheritanceModel);
        return model;
    }

    private createInheritanceUnit() {
        let inheritanceModel: DemoModel = DemoModel.create({ name: "DemoModel_with_inheritance" });

        const vehicleEnt = DemoEntity.create({ name: "Vehicle" });
        const brand = DemoAttribute.create({ name: "brand" });
        const vehicleName = DemoAttribute.create({ name: "type" });
        vehicleEnt.attributes.push(brand);
        vehicleEnt.attributes.push(vehicleName);

        const carEnt = DemoEntity.create({ name: "Car" });
        const numberplate = DemoAttribute.create({ name: "numberplate" });
        const carType = DemoAttribute.create({ name: "make" });
        // carEnt.baseEntity.push(PiElementReference.create<DemoEntity>(vehicleEnt, "DemoEntity"));
        carEnt.baseEntity = PiElementReference.create<DemoEntity>(vehicleEnt, "DemoEntity");
        carEnt.attributes.push(numberplate);
        carEnt.attributes.push(carType);

        const bikeEnt = DemoEntity.create({ name: "Bike" });
        const backseat = DemoAttribute.create({ name: "backseat" });
        const gears = DemoAttribute.create({ name: "gears" });
        // bikeEnt.baseEntity.push(PiElementReference.create<DemoEntity>(vehicleEnt, "DemoEntity"));
        bikeEnt.baseEntity = PiElementReference.create<DemoEntity>(vehicleEnt, "DemoEntity");
        bikeEnt.attributes.push(backseat);
        bikeEnt.attributes.push(gears);

        const racebikeEnt = DemoEntity.create({ name: "RaceBike" });
        const color = DemoAttribute.create({ name: "color" });
        const wheelsize = DemoAttribute.create({ name: "wheelsize" });
        // racebikeEnt.baseEntity.push(PiElementReference.create<DemoEntity>(bikeEnt, "DemoEntity"));
        racebikeEnt.baseEntity = PiElementReference.create<DemoEntity>(bikeEnt, "DemoEntity");
        racebikeEnt.attributes.push(color);
        racebikeEnt.attributes.push(wheelsize);

        inheritanceModel.entities.push(vehicleEnt);
        inheritanceModel.entities.push(carEnt);
        inheritanceModel.entities.push(bikeEnt);
        inheritanceModel.entities.push(racebikeEnt);
        return inheritanceModel;
    }

    public createInheritanceWithLoop(): Demo {
        let model = this.createInheritanceModel();
        let unit = model.models.find(m => m.name === "DemoModel_with_inheritance");
        // let Vehicle inherit from RaceBike
        unit.entities[0].baseEntity = PiElementReference.create<DemoEntity>(unit.entities[3], "DemoEntity");
        return model;
    }

    public createIncorrectModel(): Demo {
        let model: Demo = Demo.create({name:"InCorrectModel"});
        let unit: DemoModel = DemoModel.create({name: "DemoModel_1"});
        model.models.push(unit);

        const length = DemoFunction.create({name: "length"});
        const Variable1 = DemoVariable.create({name: "Variable1"});
        const VariableNumber2 = DemoVariable.create({name: "VariableNumber2"});
        length.parameters.push(Variable1);
        length.parameters.push(VariableNumber2);
        length.expression = this.addComplexExpression1();
        // length(Variable1, VariableNumber2): (IF (2 < 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * 'Person'))

        const determine = DemoFunction.create({name: "determine"});
        const AAP = DemoVariable.create({name: "AAP"});
        determine.parameters.push(AAP);
        determine.expression = MakePlusExp("Hello Demo", "Goodbye");
        // determine(AAP) = "Hello Demo" + "Goodbye"

        const last = DemoFunction.create({name: "last"});
        last.expression = MakePlusExp("5", "woord");
        // last() = 5 + "woord"

        unit.functions.push(length);
        unit.functions.push(determine);
        unit.functions.push(last);

        const personEnt = DemoEntity.create({name: "Person"});
        const age = DemoAttribute.create({name: "age"});
        const personName = DemoAttribute.create({name: "name"});
        personEnt.attributes.push(age);
        personEnt.attributes.push(personName);
        const first = DemoFunction.create({name: "first"});
        const Resultvar = DemoVariable.create({name: "Resultvar"});
        first.parameters.push(Resultvar);
        first.expression = MakePlusExp("5", "24");
        personEnt.functions.push(first);
        // Person { age, first(Resultvar) = 5 + 24 }

        const companyEnt = DemoEntity.create({name: "Company"});
        const companyName = DemoAttribute.create({name: "name"});
        const VAT_Number = DemoAttribute.create({name: "VAT_Number"});
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);

        const another = DemoFunction.create({name: "another"});
        const NOOT = DemoVariable.create({name: "NOOT"});
        another.parameters.push(NOOT);
        another.expression = this.addComplexExpression2(NOOT);
        // another(NOOT) = ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        companyEnt.functions.push(another);
        // Company { unitName, VAT_Number, another(NOOT) = ... }

        unit.entities.push(personEnt);
        unit.entities.push(companyEnt);

        this.addEntityTypes(
            companyEnt,
            personEnt,
            personName,
            companyName,
            age,
            VAT_Number,
            length,
            first,
            last,
            determine,
            another,
            Variable1,
            VariableNumber2,
            Resultvar,
            AAP,
            NOOT
        );
        return model;
    }

    public createCorrectModel(): Demo {
        let model: Demo = Demo.create({name:"CorrectModel"});
        let unit = this.createCorrectUnit();
        model.models.push(unit);
        return model;
    }

    private createCorrectUnit() {
        let unit: DemoModel = DemoModel.create({ name: "CorrectUnit" });
        const ifFunction = DemoFunction.create({ name: "compare" });
        ifFunction.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("2", "5"); //("<")
        ifExpression.whenTrue = makeLiteralExp("1");
        ifExpression.whenFalse = makeLiteralExp("5");
        const divideExpression = MakeDivideExp("1", "2");
        ifFunction.expression = ifExpression;
        // compare(Variable1, Variable2): IF (2 < 5) THEN 1 ELSE 5 ENDIF

        const helloFunction = DemoFunction.create({ name: "helloString" });
        helloFunction.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        helloFunction.expression = makeLiteralExp("Hello Demo");
        // helloString() = "Hello Demo"

        unit.functions.push(ifFunction);
        unit.functions.push(helloFunction);

        const companyEnt = DemoEntity.create({ name: "Company" });
        const companyName = DemoAttribute.create({ name: "name" });
        companyName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        const VAT_Number = DemoAttribute.create({ name: "VAT_Number" });
        VAT_Number.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);
        const work = DemoFunction.create({ name: "doClean" });
        const param = DemoVariable.create({ name: "at" });
        work.parameters.push(param);
        work.expression = MakePlusExp("5", "24");
        work.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");

        companyEnt.functions.push(work);
        // Company { VAT_Number: Integer, unitName: String, doClean(at: School) = 5 + 24 }

        const schoolEntity = DemoEntity.create({ name: "School" });

        const founded = DemoAttribute.create({ name: "foundedIn" });
        founded.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const schoolName = DemoAttribute.create({ name: "name" });
        schoolName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        schoolEntity.attributes.push(founded);
        schoolEntity.attributes.push(schoolName);
        const clean = DemoFunction.create({ name: "requestClean" });
        const variable = DemoVariable.create({ name: "cleaningCompany" });
        variable.declaredType = PiElementReference.create<DemoEntity>(companyEnt, "DemoEntity");
        clean.parameters.push(variable);
        clean.expression = MakePlusExp("5", "24");
        clean.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        schoolEntity.functions.push(clean);
        // School { foundedIn: Integer, unitName: String, requestClean(cleaningCompany: Company) = 5 + 24 }

        param.declaredType = PiElementReference.create<DemoEntity>(companyEnt, "DemoEntity");

        unit.entities.push(schoolEntity);
        unit.entities.push(companyEnt);
        return unit;
    }

    private addSimpleTypes(
        personName: DemoAttribute,
        companyName: DemoAttribute,
        age: DemoAttribute,
        VAT_Number: DemoAttribute,
        length: DemoFunction,
        first: DemoFunction,
        last: DemoFunction,
        determine: DemoFunction,
        another: DemoFunction,
        Variable1: DemoVariable,
        VariableNumber2: DemoVariable,
        Resultvar: DemoVariable,
        AAP: DemoVariable,
        NOOT: DemoVariable
    ) {
        // personName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // companyName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // age.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // VAT_Number.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // length.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // first.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // last.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // determine.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // another.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // Variable1.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // VariableNumber2.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // Resultvar.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // AAP.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // NOOT.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
    }

    private addEntityTypes(
        companyEnt: DemoEntity,
        personEnt: DemoEntity,
        personName: DemoAttribute,
        companyName: DemoAttribute,
        age: DemoAttribute,
        VAT_Number: DemoAttribute,
        length: DemoFunction,
        first: DemoFunction,
        last: DemoFunction,
        determine: DemoFunction,
        another: DemoFunction,
        Variable1: DemoVariable,
        VariableNumber2: DemoVariable,
        Resultvar: DemoVariable,
        AAP: DemoVariable,
        NOOT: DemoVariable
    ) {
        personName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        companyName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        age.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        VAT_Number.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        length.declaredType = PiElementReference.create<DemoEntity>(companyEnt, "DemoEntity");
        first.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        last.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        determine.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        another.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        Variable1.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        VariableNumber2.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        Resultvar.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        AAP.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
        NOOT.declaredType = PiElementReference.create<DemoEntity>(companyEnt, "DemoEntity");
    }

    private addComplexExpression1(): DemoExpression {
        // (IF (2 < 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * 'Person'))

        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("2", "5"); //("<")
        ifExpression.whenTrue = makeLiteralExp("1");
        ifExpression.whenFalse = makeLiteralExp("5");
        const divideExpression = MakeDivideExp("1", "2");
        const multiplyExpression = MakeMultiplyExp(divideExpression, "Person");
        const plusExpression = MakePlusExp(ifExpression, multiplyExpression);

        return plusExpression;
    }

    private addComplexExpression2(attr: DemoVariable): DemoExpression {
        // ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        const varRef = new DemoVariableRef();
        // varRef.referredName = "Variable1";
        varRef.variable = PiElementReference.create<DemoVariable>(attr, "DemoAttribute");

        const equals: DemoBinaryExpression = MakeEqualsExp("No", varRef); // ("=");
        // equals : "No" = Variable1

        const leftOr = new DemoOrExpression();
        leftOr.right = equals;
        leftOr.left = makeLiteralExp("Yes");
        // leftOr : ("Yes" or ("No" = Variable1))

        const rightAnd: DemoBinaryExpression = MakeLessThenExp("x", "122");
        // rightAnd : ("x" < 122)

        const leftAnd = MakeLessThenExp("Hello World", "Hello Universe");
        // leftAnd : ("Hello World" < "Hello Universe")

        const rightOr = new DemoAndExpression();
        rightOr.right = rightAnd;
        rightOr.left = leftAnd;
        // rightOr : ("x" < 122) AND ("Hello World" < "Hello Universe")

        const thenExpression = new DemoOrExpression();
        thenExpression.left = leftOr;
        thenExpression.right = rightOr;
        // thenExpression : ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe")

        const divideExpression = MakePlusExp("1", "2");
        // divideExpression : (1/2)

        const multiplyExpression = MakeMultiplyExp(divideExpression, null);
        // multiplyExpression : (1/2) * ...

        const plusExpression = MakePlusExp(thenExpression, multiplyExpression);
        // plusexpression : ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        return plusExpression;
    }
}
