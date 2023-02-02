import { FreNodeReference } from "@freon4dsl/core";
import {
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

        const companyEnt = DemoEntity.create({name: "Company", x: "xxx", simpleprop: "simple"}); // another one with the same unitName
        const VAT_Number = DemoAttribute.create({name: "VAT_Number", declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType")});
        const VAT_Number2 = DemoAttribute.create({name: "VAT_Number", declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType")});
        companyEnt.attributes.push(VAT_Number2);
        companyEnt.attributes.push(VAT_Number);
        unit.entities.push(companyEnt);
        const ifFunction = this.makeIfFunction2();
        companyEnt.functions.push(ifFunction);

        const double = DemoFunction.create({name: "compare", declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType")}); // another one with the same name
        const extra = DemoVariable.create({name: "Extra", declaredType: FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity")});
        const extra2 = DemoVariable.create({name: "Extra", declaredType: FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity")}); // another one with the same name
        double.parameters.push(extra);
        double.parameters.push(extra2);
        double.expression = MakePlusExp("24", "2020");
        // compare(Extra, Extra) = "24" + "2020"

        unit.functions.push(double);
        return result;
    }

    private makeIfFunction(name: string) {
        const ifFunction = DemoFunction.create({
            name: name,
            declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType")
        });
        ifFunction.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("4", "80"); //("<")
        ifExpression.whenTrue = makeLiteralExp("87");
        ifExpression.whenFalse = makeLiteralExp("1345");
        const divideExpression = MakeDivideExp("678", "9990");
        ifFunction.expression = ifExpression;
        return ifFunction;
    }


    private makeIfFunction2() {
        const ifFunction = DemoFunction.create({
            name: "compare",
            declaredType: FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType")
        });
        ifFunction.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("4", "80"); //("<")
        ifExpression.whenTrue = makeLiteralExp("87");
        ifExpression.whenFalse = makeLiteralExp("1345");
        const divideExpression = MakeDivideExp("678", "9990");
        ifFunction.expression = ifExpression;
        return ifFunction;
    }

    public createModelWithAppliedfeature(): Demo {
        let result = this.createIncorrectModel();
        let unit: DemoModel = result.models.find(m => m.name === "DemoModel_1");
        // add new attribute to Person entity
        let personent = unit.entities[0]; // Person
        let personattr = new DemoAttributeWithEntityType();
        personattr.name = "attrFromPerson";
        personattr.declaredType = FreNodeReference.create<DemoEntity>(unit.entities[1], "DemoEntity"); // Company
        personent.entAttributes.push(personattr);

        // add new attribute to Company entity
        let companyent = unit.entities[1]; // Company
        let compattr = new DemoAttributeWithEntityType();
        compattr.name = "attrFromCompany";
        compattr.declaredType = FreNodeReference.create<DemoEntity>(unit.entities[0], "DemoEntity"); // Person
        companyent.entAttributes.push(compattr);

        // find the function to be changed
        let length = unit.functions[0];

        // create an expression that includes applied features
        let expression: DemoVariableRef = new DemoVariableRef();
        expression.variable = FreNodeReference.create<DemoVariable>(length.parameters[0], "DemoVariable"); // Variable1: Person
        // add an applied feature to the variable reference
        let firstFeature: DemoAttributeRef = new DemoAttributeRef();
        firstFeature.attribute = FreNodeReference.create<DemoAttributeWithEntityType>(personattr, "DemoAttributeWithEntityType"); // Person.attrFromPerson: Company
        expression.appliedfeature = firstFeature;
        // add a second applied feature to the attribute reference
        let secondFeature: DemoAttributeRef = new DemoAttributeRef();
        secondFeature.attribute = FreNodeReference.create<DemoAttributeWithEntityType>(compattr, "DemoAttributeWithEntityType"); // Company.attrFromCompany: Person
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

        const vehicleEnt = DemoEntity.create({ name: "Vehicle", x: "xxx", simpleprop: "simple" });
        const brand = DemoAttribute.create({ name: "brand", declaredType: FreNodeReference.create<DemoAttributeType>("String", "DemoAttributeType") });
        const vehicleName = DemoAttribute.create({ name: "type", declaredType: FreNodeReference.create<DemoAttributeType>("String", "DemoAttributeType") });
        vehicleEnt.attributes.push(brand);
        vehicleEnt.attributes.push(vehicleName);

        const carEnt = DemoEntity.create({ name: "Car", x: "xxx", simpleprop: "simple" });
        const numberplate = DemoAttribute.create({ name: "numberplate", declaredType: FreNodeReference.create<DemoAttributeType>("Integer", "DemoAttributeType") });
        const carType = DemoAttribute.create({ name: "make", declaredType: FreNodeReference.create<DemoAttributeType>("String", "DemoAttributeType") });
        // carEnt.baseEntity.push(FreNodeReference.create<DemoEntity>(vehicleEnt, "DemoEntity"));
        carEnt.baseEntity = FreNodeReference.create<DemoEntity>(vehicleEnt, "DemoEntity");
        carEnt.attributes.push(numberplate);
        carEnt.attributes.push(carType);

        const bikeEnt = DemoEntity.create({ name: "Bike", x: "xxx", simpleprop: "simple" });
        const backseat = DemoAttribute.create({ name: "backseat", declaredType: FreNodeReference.create<DemoAttributeType>("Boolean", "DemoAttributeType") });
        const gears = DemoAttribute.create({ name: "gears", declaredType: FreNodeReference.create<DemoAttributeType>("Integer", "DemoAttributeType") });
        // bikeEnt.baseEntity.push(FreNodeReference.create<DemoEntity>(vehicleEnt, "DemoEntity"));
        bikeEnt.baseEntity = FreNodeReference.create<DemoEntity>(vehicleEnt, "DemoEntity");
        bikeEnt.attributes.push(backseat);
        bikeEnt.attributes.push(gears);

        const racebikeEnt = DemoEntity.create({ name: "RaceBike", x: "xxx", simpleprop: "simple" });
        const color = DemoAttribute.create({ name: "color", declaredType: FreNodeReference.create<DemoAttributeType>("String", "DemoAttributeType") });
        const wheelsize = DemoAttribute.create({ name: "wheelsize", declaredType: FreNodeReference.create<DemoAttributeType>("Integer", "DemoAttributeType") });
        // racebikeEnt.baseEntity.push(FreNodeReference.create<DemoEntity>(bikeEnt, "DemoEntity"));
        racebikeEnt.baseEntity = FreNodeReference.create<DemoEntity>(bikeEnt, "DemoEntity");
        racebikeEnt.attributes.push(color);
        racebikeEnt.attributes.push(wheelsize);

        inheritanceModel.entities.push(vehicleEnt);
        inheritanceModel.entities.push(carEnt);
        inheritanceModel.entities.push(bikeEnt);
        inheritanceModel.entities.push(racebikeEnt);

        // add functions to everything because this part is not optional
        inheritanceModel.functions.push(this.makeIfFunction("SOME_MODEL"));
        vehicleEnt.functions.push(this.makeIfFunction("SOME_VEHICLE"));
        carEnt.functions.push(this.makeIfFunction("SOME_CAR"));
        bikeEnt.functions.push(this.makeIfFunction("SOME_BIKE"));
        racebikeEnt.functions.push(this.makeIfFunction("SOME_RACEBIKE"));
        return inheritanceModel;
    }

    public createInheritanceWithLoop(): Demo {
        let model = this.createInheritanceModel();
        let unit = model.models.find(m => m.name === "DemoModel_with_inheritance");
        // let Vehicle inherit from RaceBike
        unit.entities[0].baseEntity = FreNodeReference.create<DemoEntity>(unit.entities[3], "DemoEntity");
        return model;
    }

    public createIncorrectModel(): Demo {
        let model: Demo = Demo.create({name:"InCorrectModel"}); // , models: [DemoModel.create({name: "DemoModel_1"})]});
        let unit: DemoModel = DemoModel.create({name: "DemoModel_1"});
        model.models.push(unit);

        const company = this.makeCompanyEntity();
        const school = this.makeSchoolEntity(company);

        const funcWithManyParams = DemoFunction.create({name: "manyParams"});
        for (let i = 0; i < 10; i++) {
            let type: FreNodeReference<DemoEntity>;
            if ( i % 2 === 0) {
                type = FreNodeReference.create<DemoEntity>(company, "DemoEntity");
            } else {
                type = FreNodeReference.create<DemoEntity>(school, "DemoEntity");
            }
            const param = DemoVariable.create({ name: `Var${i}`, declaredType: type });
            funcWithManyParams.parameters.push(param);
        }
        funcWithManyParams.expression = this.addComplexExpression1();
        funcWithManyParams.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");;

        const length = DemoFunction.create({name: "length"});
        const Variable1 = DemoVariable.create({name: "Variable1"});
        const VariableNumber2 = DemoVariable.create({name: "VariableNumber2"});
        length.parameters.push(Variable1);
        length.parameters.push(VariableNumber2);
        length.expression = this.addComplexExpression1();
        length.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");;
        // length(Variable1, VariableNumber2): (IF (2 < 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * 'Person'))

        const determine = DemoFunction.create({name: "determine"});
        const AAP = DemoVariable.create({name: "AAP"});
        determine.parameters.push(AAP);
        determine.expression = MakePlusExp("Hello Demo", "Goodbye");
        determine.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // determine(AAP) = "Hello Demo" + "Goodbye"

        const last = DemoFunction.create({name: "last"});
        last.expression = MakePlusExp("5", "woord");
        last.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // last() = 5 + "woord"

        unit.functions.push(length);
        unit.functions.push(determine);
        unit.functions.push(last);
        unit.functions.push(funcWithManyParams);

        const personEnt = DemoEntity.create({name: "Person", x: "xxx", simpleprop: "simple"});
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

        const companyEnt = DemoEntity.create({name: "Company2", x: "xxx", simpleprop: "simple"});
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
        unit.entities.push(company);
        unit.entities.push(school);

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
        ifFunction.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const ifExpression = new DemoIfExpression();
        ifExpression.condition = MakeLessThenExp("2", "5"); //("<")
        ifExpression.whenTrue = makeLiteralExp("1");
        ifExpression.whenFalse = makeLiteralExp("5");
        const divideExpression = MakeDivideExp("1", "2");
        ifFunction.expression = ifExpression;
        // compare(Variable1, Variable2): IF (2 < 5) THEN 1 ELSE 5 ENDIF

        const helloFunction = DemoFunction.create({ name: "helloString" });
        helloFunction.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        helloFunction.expression = makeLiteralExp("Hello Demo");
        // helloString() = "Hello Demo"

        unit.functions.push(ifFunction);
        unit.functions.push(helloFunction);

        const companyEnt = DemoEntity.create({ name: "Company", x: "xxx", simpleprop: "simple" });
        const companyName = DemoAttribute.create({ name: "name" });
        companyName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        const VAT_Number = DemoAttribute.create({ name: "VAT_Number" });
        VAT_Number.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);
        const work = DemoFunction.create({ name: "doClean" });
        const param = DemoVariable.create({ name: "at" });
        work.parameters.push(param);
        work.expression = MakePlusExp("5", "24");
        work.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");

        companyEnt.functions.push(work);
        // Company { VAT_Number: Integer, unitName: String, doClean(at: School) = 5 + 24 }

        const schoolEntity = DemoEntity.create({ name: "School", x: "xxx", simpleprop: "simple" });

        const founded = DemoAttribute.create({ name: "foundedIn" });
        founded.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const schoolName = DemoAttribute.create({ name: "name" });
        schoolName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        schoolEntity.attributes.push(founded);
        schoolEntity.attributes.push(schoolName);
        const clean = DemoFunction.create({ name: "requestClean" });
        const variable = DemoVariable.create({ name: "cleaningCompany" });
        variable.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");
        clean.parameters.push(variable);
        clean.expression = MakePlusExp("5", "24");
        clean.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        schoolEntity.functions.push(clean);
        // School { foundedIn: Integer, unitName: String, requestClean(cleaningCompany: Company) = 5 + 24 }

        param.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");

        unit.entities.push(schoolEntity);
        unit.entities.push(companyEnt);
        return unit;
    }

    private makeSchoolEntity(companyEnt: DemoEntity) {
        const schoolEntity = DemoEntity.create({ name: "School", x: "xxx", simpleprop: "simple" });

        const founded = DemoAttribute.create({ name: "foundedIn" });
        founded.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        const schoolName = DemoAttribute.create({ name: "name" });
        schoolName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        schoolEntity.attributes.push(founded);
        schoolEntity.attributes.push(schoolName);
        const clean = DemoFunction.create({ name: "requestClean" });
        const variable = DemoVariable.create({ name: "cleaningCompany" });
        variable.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");
        clean.parameters.push(variable);
        clean.expression = MakePlusExp("5", "24");
        clean.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        schoolEntity.functions.push(clean);
        // School { foundedIn: Integer, unitName: String, requestClean(cleaningCompany: Company) = 5 + 24 }
        return schoolEntity;
    }

    private makeCompanyEntity() {
        const companyEnt = DemoEntity.create({ name: "Company", x: "xxx", simpleprop: "simple" });
        const companyName = DemoAttribute.create({ name: "name" });
        companyName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        const VAT_Number = DemoAttribute.create({ name: "VAT_Number" });
        VAT_Number.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);
        const work = DemoFunction.create({ name: "doClean" });
        const param = DemoVariable.create({ name: "at" });
        param.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");
        work.parameters.push(param);
        work.expression = MakePlusExp("5", "24");
        work.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");

        companyEnt.functions.push(work);
        // Company { VAT_Number: Integer, unitName: String, doClean(at: School) = 5 + 24 }
        return companyEnt;
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
        // personName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // companyName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // age.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // VAT_Number.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        // length.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        // first.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // last.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // determine.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // another.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // Variable1.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // VariableNumber2.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // Resultvar.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // AAP.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
        // NOOT.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
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
        personName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        companyName.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
        age.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        VAT_Number.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
        length.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");
        first.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        last.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        determine.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        another.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        Variable1.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        VariableNumber2.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        Resultvar.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        AAP.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
        NOOT.declaredType = FreNodeReference.create<DemoEntity>(companyEnt, "DemoEntity");
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
        varRef.variable = FreNodeReference.create<DemoVariable>(attr, "DemoAttribute");

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
