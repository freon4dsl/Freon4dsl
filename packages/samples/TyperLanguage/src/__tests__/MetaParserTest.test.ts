import {describe, test, expect} from "vitest";
import {FreError} from "@freon4dsl/core";
import {FileHandler} from "./FileHandler.js";
import { FreStructureDef, FreTyperModel, FreTyperDef } from '../language/gen';
import { FreTyperEnvironment } from '../config/gen/FreTyperEnvironment';

describe("Fre Typer Parser", () => {
    const reader = FreTyperEnvironment.getInstance().reader;
    const writer = FreTyperEnvironment.getInstance().writer;
    const validator = FreTyperEnvironment.getInstance().validator;
    const scoper = FreTyperEnvironment.getInstance().scoper;
    const fileHandler = new FileHandler();

    test(" on .type file", () => {
        const completeModel: FreTyperModel = new FreTyperModel();
        const languageStr = fileHandler.stringFromFile("/typer-test/types.ast");
        const langUnit: FreStructureDef = reader.readFromString(languageStr, "FreStructureDef", completeModel, "typer-test/types.ast") as FreStructureDef;
        expect(langUnit).not.toBe(null);
        expect(langUnit).not.toBe(undefined);
        expect(langUnit).toBeInstanceOf(FreStructureDef);

        const input = fileHandler.stringFromFile("/typer-test/type-rules.type");
        const typeUnit: FreTyperDef = reader.readFromString(input, "FreTyperDef", completeModel, "/typer-test/type-rules.type") as FreTyperDef;
        expect(typeUnit).not.toBe(null);
        expect(typeUnit).not.toBe(undefined);
        expect(typeUnit).toBeInstanceOf(FreTyperDef);

        const conc = langUnit.concepts.find(x => x.name === "SimpleExp1");
        expect(conc).not.toBeNull();
        expect(conc).not.toBeUndefined();
        // console.log(`visible in langUnit: ${scoper.getVisibleElements(langUnit).map(elem => `${elem.name}`).join(", ")}`);
        // console.log(`visible in typeUnit: ${scoper.getVisibleElements(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
        // console.log(`visible in complete model: ${scoper.getVisibleElements(completeModel).map(elem => `${elem.name}`).join(", ")}`);

        const simpleExpRule = typeUnit.classifierSpecs.find(rule => rule.myClassifier.name === "SimpleExp1");
        // console.log(`visible in simpleExpRule: ${scoper.getVisibleElements(simpleExpRule).map(elem => `${elem.name}`).join(", ")}`);

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
