import { FreNodeReference } from "@freon4dsl/core";
import { Attribute, CheckingRule, Data, Entity, Rules, RulesModel, Type } from "../freon/language/index.js";

export function createModel(name: string): RulesModel {
    const result = new RulesModel();
    result.name = name;
    // result.dataUnits.push(createData(name + "_data"))
    // result.ruleUnits.push(createRules(name + "_rules"))
    return result;
}

export function fillDataUnit(unit: Data): void {
    unit.entities.push(
        Entity.create({
            name: unit.name + "_entity1",
            attributes: [createAttribute("attString", "String"), createAttribute("attBoolean", "Boolean")],
        }),
    );
    unit.entities.push(
        Entity.create({
            name: unit.name + "_entity2",
            attributes: [
                createAttribute("attDate", "Date"),
                createAttribute("attInteger", "Integer"),
                createAttribute("attError", "Unknown"),
            ],
        }),
    );
}

export function fillRulesUnit(unit: Rules): void {
    unit.rules.push(CheckingRule.create({ name: unit.name + "_rule1" }));
    unit.rules.push(CheckingRule.create({ name: unit.name + "_rule2" }));
}

export function createAttribute(name: string, type: string): Attribute {
    const result = Attribute.create({ name: name });
    result.declaredType = FreNodeReference.create<Type>(type, "Type");
    return result;
}

export function modelToString(model: RulesModel): string {
    let result = `Model: ${model.name}\n`;
    model.dataUnits.forEach((data) => {
        result += `Data: ${data.name}\n`;
        data.entities.forEach((entity) => {
            result += `  Entity: ${entity.name}\n`;
            entity.attributes.forEach((attribute) => {
                const type = !!attribute.declaredType.referred
                    ? attribute.declaredType.referred.name
                    : "?" + attribute.declaredType["_FRE_pathname"] + "?";
                result += `    Attribute: ${attribute.name}  : ${type}\n`;
            });
        });
    });
    model.ruleUnits.forEach((ruleUnit) => {
        result += `Rules: ${ruleUnit.name}\n`;
        ruleUnit.rules.forEach((rule) => {
            result += `  ${rule.freLanguageConcept()}: ${rule.name}\n`;
        });
    });
    return result;
}
