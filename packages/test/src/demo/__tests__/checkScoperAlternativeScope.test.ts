import { DemoEnvironment } from "../freon/config/gen/DemoEnvironment.js";
import { AppliedFeature, DemoAttributeRef, Demo, initializeLanguage } from '../freon/language/gen/index.js';
import { DemoModelCreator } from "./DemoModelCreator.js";
import { describe,  test, expect, beforeEach } from "vitest";
import { isInScope, } from '../../utils/HelperFunctions.js';
import { FreNamedNode } from '@freon4dsl/core';
import { initializeScoperDef } from '../scoper/gen';
// import { FileHandler } from '../../utils/FileHandler';


describe("testing Alternative Scopes", () => {
    DemoEnvironment.getInstance();

    describe("testing IsInScope", () => {
        let scoper = DemoEnvironment.getInstance().scoper;
        let model: Demo = new DemoModelCreator().createModelWithAppliedfeature();
        // in correctModel function length is changed into:
        // 'length (Variable1 : Person, VariableNumber2 : Boolean): String =
        //      Variable1.attrFromPerson.attrFromCompany
        // where 'Variable1.attrFromPerson' is of type Company

        test("what isInscope of 'Variable1.attrFromPerson', Variable1: Person", () => {
            let appliedFeature: AppliedFeature = model.models[0].functions[0].expression.appliedfeature;
            const visibleFromVariable1_attrFromPerson: FreNamedNode[] = scoper.getVisibleNodes(appliedFeature);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "name")).toBe(true);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "Person")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "Company")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "VAT_Number")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "length")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "first")).toBe(true);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "last")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "determine")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "another")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "Variable1")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "VariableNumber2")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "AAP")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson, "NOOT")).toBe(false);
        });

        test("isInscope 'name' of 'Variable1.attrFromPerson.attrFromCompany', attrFromPerson: Company", () => {
            let testfeat = model.models[0].functions[0].expression.appliedfeature;
            let appliedFeature: AppliedFeature = testfeat.appliedfeature;
            expect(model.models[0].functions[0].name).toBe("length");
            expect((testfeat as DemoAttributeRef).attribute.name).toBe(
                "attrFromPerson",
            );
            expect(
                (testfeat.appliedfeature as DemoAttributeRef).attribute
                    .name,
            ).toBe("attrFromCompany");
            const visibleFromVariable1_attrFromPerson_attrFromCompany: FreNamedNode[] = scoper.getVisibleNodes(appliedFeature);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "name")).toBe(true);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "Person")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "Company")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "VAT_Number")).toBe(true);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "length")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "first")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "last")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "determine")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "another")).toBe(true);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "Variable1")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "VariableNumber2")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "AAP")).toBe(false);
            expect(isInScope(visibleFromVariable1_attrFromPerson_attrFromCompany, "NOOT")).toBe(false);
        });
    });
});
