import { FileHandler } from "./FileHandler";
import { PiStructureDef, PiValidatorDef, PiScoperDef, PiTyperDef, PiLanguage } from "../language/gen";
import { PiError } from "@freon4dsl/core";
import { PiLanguageEnvironment } from "../config/gen/PiLanguageEnvironment";

describe("Pi Language Parser", () => {
    const reader = PiLanguageEnvironment.getInstance().reader;
    const writer = PiLanguageEnvironment.getInstance().writer;
    const validator = PiLanguageEnvironment.getInstance().validator;
    const scoper = PiLanguageEnvironment.getInstance().scoper;
    const fileHandler = new FileHandler();

    test.skip( " on .ast file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.ast");
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
            const input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.scope");
            const unit1: PiScoperDef = reader.readFromString(input, "PiScoperDef", completeModel) as PiScoperDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test.skip( " on .valid file", () => {
        try {
            const completeModel: PiLanguage = new PiLanguage();
            const input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.valid");
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
            const languageStr = fileHandler.stringFromFile("src/PiLanguage/__inputs__/typer-test/types.ast");
            const langUnit: PiStructureDef = reader.readFromString(languageStr, "PiStructureDef", completeModel) as PiStructureDef;

            const input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/typer-test/type-rules.type");
            const typeUnit: PiTyperDef = reader.readFromString(input, "PiTyperDef", completeModel) as PiTyperDef;

            const conc = langUnit.concepts.find(x => x.name ==="SimpleExp1");
            expect (conc).not.toBeNull();
            expect (conc).not.toBeUndefined();
            // console.log(`visible in langUnit: ${scoper.getVisibleElements(langUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in typeUnit: ${scoper.getVisibleElements(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in complete model: ${scoper.getVisibleElements(completeModel).map(elem => `${elem.name}`).join(", ")}`);

            const simpleExpRule = typeUnit.classifierSpecs.find(rule => rule.myClassifier.name === "SimpleExp1");
            // console.log(`visible in simpleExpRule: ${scoper.getVisibleElements(simpleExpRule).map(elem => `${elem.name}`).join(", ")}`);

            const errors: PiError[] = validator.validate(typeUnit);
            // TODO MetaType.scope and .valid are not yet adjusted to the new structure in MetaType.ast
            // expect(errors.length).toBe(0);
            // console.log("found " + errors.length + " errors");
            // errors.forEach(e => {
            //     console.log(e.message + " in '" + e.locationdescription + "' of severity '" + e.severity + "'")
            // });
            //
            // expect(typeUnit.types.length).toBe(2);
            // expect(typeUnit.anyTypeSpec).not.toBeNull();
            // console.log(writer.writeToString(typeUnit, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

});
