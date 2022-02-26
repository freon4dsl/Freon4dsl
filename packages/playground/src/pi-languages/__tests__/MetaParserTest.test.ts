import { PiLanguageEnvironment } from "../environment/gen/PiLanguageEnvironment";
import { FileHandler } from "./FileHandler";
import { PiStructureDef, PiValidatorDef, PiScoperDef, PiTyperDef, PiElementReference, PiLanguage } from "../language/gen";
import { PiError } from "@projectit/core";

describe("Pi Language Parser", () => {
    const reader = PiLanguageEnvironment.getInstance().reader;
    const writer = PiLanguageEnvironment.getInstance().writer;
    const validator = PiLanguageEnvironment.getInstance().validator;
    const scoper = PiLanguageEnvironment.getInstance().scoper;
    const fileHandler = new FileHandler();

    test( " on .ast file", () => {
        try {
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.ast");
            const unit1: PiStructureDef = reader.readFromString(input, "PiStructureDef") as PiStructureDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on .scope file", () => {
        try {
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.scope");
            const unit1: PiScoperDef = reader.readFromString(input, "PiScoperDef") as PiScoperDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test( " on .valid file", () => {
        try {
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/LanguageDefinition.valid");
            const unit1: PiValidatorDef = reader.readFromString(input, "PiValidatorDef") as PiValidatorDef;
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test( " on .type file", () => {
        try {
            const languageStr = fileHandler.stringFromFile("src/pi-languages/__inputs__/typer-test/types.ast");
            const langUnit: PiStructureDef = reader.readFromString(languageStr, "PiStructureDef") as PiStructureDef;
            const input = fileHandler.stringFromFile("src/pi-languages/__inputs__/typer-test/type-rules.type");
            const typeUnit: PiTyperDef = reader.readFromString(input, "PiTyperDef") as PiTyperDef;

            // const conc = langUnit.concepts.find(x => x.name ==="SimpleExp1");
            // expect (conc).not.toBeNull();
            // expect (conc).not.toBeUndefined();

            const completeModel: PiLanguage = new PiLanguage();
            completeModel.addUnit(langUnit);
            completeModel.addUnit(typeUnit);
            // console.log(`visible in langUnit: ${scoper.getVisibleElements(langUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in typeUnit: ${scoper.getVisibleElements(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in complete model: ${scoper.getVisibleElements(completeModel).map(elem => `${elem.name}`).join(", ")}`);

            const errors: PiError[] = validator.validate(typeUnit);
            // expect(errors.length).toBe(1);
            console.log("found " + errors.length + " errors");
            errors.forEach(e => {
                // expect(e.reportedOn).toBe(mult.right);
                console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
            });

            // console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

});
