"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileHandler_1 = require("./FileHandler");
var gen_1 = require("../language/gen");
var PiLanguageEnvironment_1 = require("../config/gen/PiLanguageEnvironment");
describe("Pi Language Parser", function () {
    var reader = PiLanguageEnvironment_1.PiLanguageEnvironment.getInstance().reader;
    var writer = PiLanguageEnvironment_1.PiLanguageEnvironment.getInstance().writer;
    var validator = PiLanguageEnvironment_1.PiLanguageEnvironment.getInstance().validator;
    var scoper = PiLanguageEnvironment_1.PiLanguageEnvironment.getInstance().scoper;
    var fileHandler = new FileHandler_1.FileHandler();
    test.skip(" on .ast file", function () {
        try {
            var completeModel = new gen_1.PiLanguage();
            var input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.ast");
            var unit1 = reader.readFromString(input, "PiStructureDef", completeModel);
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        }
        catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });
    test(" on .scope file", function () {
        try {
            var completeModel = new gen_1.PiLanguage();
            var input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.scope");
            var unit1 = reader.readFromString(input, "PiScoperDef", completeModel);
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        }
        catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });
    test.skip(" on .valid file", function () {
        try {
            var completeModel = new gen_1.PiLanguage();
            var input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/LanguageDefinition.valid");
            var unit1 = reader.readFromString(input, "PiValidatorDef", completeModel);
            console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        }
        catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });
    test(" on .type file", function () {
        try {
            var completeModel = new gen_1.PiLanguage();
            var languageStr = fileHandler.stringFromFile("src/PiLanguage/__inputs__/typer-test/types.ast");
            var langUnit = reader.readFromString(languageStr, "PiStructureDef", completeModel);
            var input = fileHandler.stringFromFile("src/PiLanguage/__inputs__/typer-test/type-rules.type");
            var typeUnit = reader.readFromString(input, "PiTyperDef", completeModel);
            var conc = langUnit.concepts.find(function (x) { return x.name === "SimpleExp1"; });
            expect(conc).not.toBeNull();
            expect(conc).not.toBeUndefined();
            // console.log(`visible in langUnit: ${scoper.getVisibleElements(langUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in typeUnit: ${scoper.getVisibleElements(typeUnit).map(elem => `${elem.name}`).join(", ")}`);
            // console.log(`visible in complete model: ${scoper.getVisibleElements(completeModel).map(elem => `${elem.name}`).join(", ")}`);
            var simpleExpRule = typeUnit.classifierSpecs.find(function (rule) { return rule.myClassifier.name === "SimpleExp1"; });
            // console.log(`visible in simpleExpRule: ${scoper.getVisibleElements(simpleExpRule).map(elem => `${elem.name}`).join(", ")}`);
            var errors = validator.validate(typeUnit);
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
        }
        catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });
});
