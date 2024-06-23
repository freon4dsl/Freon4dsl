import { FreModelUnit } from "@freon4dsl/core";
import { Concept, ConceptInterface, Containment, Enumeration, Feature, Language, PrimitiveType, Property, Reference } from "../language/gen/index";

export class LionWeb2FreonTemplate {

    generateFreonAst(metamodel: FreModelUnit): string {
        let result = "";
        result += (`language ${metamodel.name}\n`);
        (metamodel as Language).entities.forEach(entity => {
            switch(entity.freLanguageConcept()) {
                case "Concept":
                    const concept = entity as Concept;
                    const abstract = concept.abstract ? "abstract " : "";
                    const base = !!(concept.extends)? ` base ${concept.extends.name}`: "";
                    const implments = concept.implements.length !== 0 ? `implements ${concept.implements.map(i => i.name).join(", ")} ` : "";
                    result += (`${abstract}concept ${concept.name}${base}${implments} {\n`);
                    (entity as Concept).features.forEach(feature => {
                        result += this.exportFeature(feature) + "\n";
                    });
                    break;
                case "ConceptInterface":
                    const intface = entity as ConceptInterface;
                    const xtends = intface.extends.length !== 0 ? `extends ${intface.extends.map(i => i.name).join(", ")} ` : "";
                    result += (`interface ${intface.name} {\n`);
                    intface.features.forEach(feature => {
                        result += this.exportFeature(feature) + "\n";
                    });
                    break;
                case "Enumeration":
                    const enumeration = entity as Enumeration;
                    result += (`limited ${enumeration.name} {\n`);
                    enumeration.literals.forEach(literal => {
                        result += (`    ${literal.name};\n`);
                    });
                    break;
                case "PrimitiveType":
                    const primType = entity as PrimitiveType;
                    result += (`concept ${primType.name} { // primitive\n`);
                    break;
                default:
                    console.log(`Unknown concept type =>  ${entity.name}: ${entity.freLanguageConcept()}`)
            };
            result += ("}\n");
        });
        return result;
    }

    exportFeature(feature: Feature): string {
        switch (feature.freLanguageConcept()) {
            case "Property":
                return (`    ${feature.name}: ${(feature as Property).type.name};`);
                break;
            case "Reference":
                return (`    reference ${feature.name}: ${(feature as Reference).type.name}${(feature as Reference).multiple ? "[]" : ""};`);
                break;
            case "Containment":
                return (`    ${feature.name}: ${(feature as Containment).type.name}${(feature as Containment).multiple ? "[]" : ""};`);
                break;
            default:
                return (`    ${feature.name}: ${feature.freLanguageConcept()}`);
        }
    }

}
