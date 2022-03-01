import { PiLanguageEnvironment } from "../environment/gen/PiLanguageEnvironment";
import { FileHandler } from "./FileHandler";
import { PiStructureDef, PiValidatorDef, PiScoperDef, PiTyperDef, PiLanguage } from "../language/gen";
import { PiError } from "@projectit/core";
import { StructurePrint } from "./StructurePrint";

describe("Pi Language Parser", () => {
    const reader = PiLanguageEnvironment.getInstance().reader;
    const writer = PiLanguageEnvironment.getInstance().writer;
    const validator = PiLanguageEnvironment.getInstance().validator;
    const scoper = PiLanguageEnvironment.getInstance().scoper;
    const fileHandler = new FileHandler();

    test( " on .ast file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.ast");
            const unit1: PiStructureDef = reader.readFromString(input, "PiStructureDef", completeModel) as PiStructureDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on .scope file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.scope");
            const unit1: PiScoperDef = reader.readFromString(input, "PiScoperDef", completeModel) as PiScoperDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test( " on .valid file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.valid");
            const unit1: PiValidatorDef = reader.readFromString(input, "PiValidatorDef", completeModel) as PiValidatorDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test( " on .type file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const languageStr = fileHandler.stringFromFile("src/pi-languages/__inputs__/typer-test/types.ast");
            const langUnit: PiStructureDef = reader.readFromString(languageStr, "PiStructureDef", completeModel) as PiStructureDef;

            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/typer-test/type-rules.type");
            const typeUnit: PiTyperDef = reader.readFromString(input, "PiTyperDef", completeModel) as PiTyperDef;

            const conc = langUnit.concepts.find(x => x.name ==="SimpleExp1");
            expect (conc).not.toBeNull();
            expect (conc).not.toBeUndefined();
            // console.log(`visible in langUnit: ${scoper.getVisibleElements(langUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in typeUnit: ${scoper.getVisibleElements(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in complete model: ${scoper.getVisibleElements(completeModel).map(elem => `${elem.name}`).join(", ")}`);

            // result with PiClassifier as type and PiConcept additional namespace:
            // visible in typeUnit: NONE, Horizontal, Vertical, NONE, Terminator, Separator, string, boolean, number, identifier, equalsto, conformsto, =, >, >=, <, <=, TyTest, TYPER, TyTest, unitB, unitA, unitC, Line, SimpleExp1, SimpleExp2, NamedExp, PlusExp, UnitLiteral, GenericLiteral, PredefinedType, NamedType, TypeDeclaration, SimpleType, GenericType, GenericKind, UnitOfMeasurement, UnitKind, Exp, Type, unitA, unitB, typeDefs, lines, lines, exp, name
            // result without PiClassifier as type and PiConcept additional namespace:
            // visible in typeUnit: NONE, Horizontal, Vertical, NONE, Terminator, Separator, string, boolean, number, identifier, equalsto, conformsto, =, >, >=, <, <=, TyTest, TYPER, TyTest, unitB, unitA, unitC, Line, SimpleExp1, SimpleExp2, NamedExp, PlusExp, UnitLiteral, GenericLiteral, PredefinedType, NamedType, TypeDeclaration, SimpleType, GenericType, GenericKind, UnitOfMeasurement, UnitKind, Exp, Type, unitA, unitB, typeDefs, lines, lines, exp, expr, type, xx, xx, myType, left, right, inner, unit, content, kind, Simple1, Simple2, ANY, NULL, name, type, innerType, kind, Set, Sequence, Bag, Collection, baseType, unit, Meters, Grams, kWh, Hours, name

            // const simpleExpRule = typeUnit.classifierRules.find(rule => rule.myClassifier.name === "SimpleExp1");
            // console.log(`visible in simpleExpRule: ${scoper.getVisibleElements(simpleExpRule).map(elem => `${elem.name}`).join(", ")}`);

            const errors: PiError[] = validator.validate(typeUnit);
            // expect(errors.length).toBe(0);
            console.log("found " + errors.length + " errors");
            errors.forEach(e => {
                console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
            });

            expect(typeUnit.types.length).toBe(3);
            expect(typeUnit.anyTypeRule).not.toBeNull();
            // new StructurePrint().print(typeUnit);
            // console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

});
