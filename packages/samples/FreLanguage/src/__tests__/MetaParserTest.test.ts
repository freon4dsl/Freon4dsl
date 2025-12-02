import { FreStructureDef, FreValidatorDef, FreScoperDef, FreTyperDef, FreLanguageX} from "../freon/language/index.js";
import { FreError } from "@freon4dsl/core"
import { FreLanguageXEnvironment } from "../freon/config/FreLanguageXEnvironment.js";
import { describe, test, expect } from "vitest";
import { FileUtil } from '@freon4dsl/test-helpers';

describe("Fre Language Parser", () => {
    const reader = FreLanguageXEnvironment.getInstance().reader;
    const writer = FreLanguageXEnvironment.getInstance().writer;
    const validator = FreLanguageXEnvironment.getInstance().validator;
    const scoper = FreLanguageXEnvironment.getInstance().scoper;
    const path = './packages/samples/FreLanguage/src/__inputs__/'
    
    test(" on .ast file", () => {
        const completeModel: FreLanguageX = new FreLanguageX();
        const input = FileUtil.stringFromFile(path + "LanguageDefinition.ast");
        const unit1: FreStructureDef = reader.readFromString(input, "FreStructureDef", completeModel, "LanguageDefinition.ast") as FreStructureDef;
        expect(unit1).not.toBe(null);
        expect(unit1).not.toBe(undefined);
        expect(unit1).toBeInstanceOf(FreStructureDef);
        console.log(writer.writeToString(unit1, 0, false));
        // expect(unit1).toMatchSnapshot();
    });

    test(" on .scope file", () => {
        const completeModel: FreLanguageX = new FreLanguageX();
        const input = FileUtil.stringFromFile(path + "LanguageDefinition.scope");
        const unit1: FreScoperDef = reader.readFromString(input, "FreScoperDef", completeModel, 'LanguageDefinition.scope') as FreScoperDef;
        expect(unit1).not.toBe(null);
        expect(unit1).not.toBe(undefined);
        expect(unit1).toBeInstanceOf(FreScoperDef);
        console.log(writer.writeToString(unit1, 0, false));
        // expect(unit1).toMatchSnapshot();
    });

    test.skip(" on .valid file", () => {
        const completeModel: FreLanguageX = new FreLanguageX();
        const input = FileUtil.stringFromFile(path + "LanguageDefinition.valid");
        const unit1: FreValidatorDef = reader.readFromString(input, "FreValidatorDef", completeModel, 'LanguageDefinition.valid') as FreValidatorDef;
        console.log(writer.writeToString(unit1, 0, false));
        // expect(unit1).toMatchSnapshot();
    });

    test(" on .type file", () => {
        const completeModel: FreLanguageX = new FreLanguageX();
        const languageStr = FileUtil.stringFromFile(path + "typer-test/types.ast");
        const langUnit: FreStructureDef = reader.readFromString(languageStr, "FreStructureDef", completeModel, "typer-test/types.ast") as FreStructureDef;
        expect(langUnit).not.toBe(null);
        expect(langUnit).not.toBe(undefined);
        expect(langUnit).toBeInstanceOf(FreStructureDef);

        const input = FileUtil.stringFromFile(path + "typer-test/type-rules.type");
        const typeUnit: FreTyperDef = reader.readFromString(input, "FreTyperDef", completeModel, "/typer-test/type-rules.type") as FreTyperDef;
        expect(typeUnit).not.toBe(null);
        expect(typeUnit).not.toBe(undefined);
        expect(typeUnit).toBeInstanceOf(FreTyperDef);

        const conc = langUnit.concepts.find(x => x.name === "SimpleExp1");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();
        // console.log(`visible in langUnit: ${scoper.getVisibleNodes(langUnit).map(elem => `${elem.name}`).join(", ")}`);
        // console.log(`visible in typeUnit: ${scoper.getVisibleNodes(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
        // console.log(`visible in complete model: ${scoper.getVisibleNodes(completeModel).map(elem => `${elem.name}`).join(", ")}`);

        const simpleExpRule = typeUnit.classifierSpecs.find(rule => rule.myClassifier.name === "SimpleExp1");
        // console.log(`visible in simpleExpRule: ${scoper.getVisibleNodes(simpleExpRule).map(elem => `${elem.name}`).join(", ")}`);

        const errors: FreError[] = validator.validate(typeUnit);
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
    });

});
