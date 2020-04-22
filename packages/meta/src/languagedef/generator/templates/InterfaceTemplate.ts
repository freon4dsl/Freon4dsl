import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import {
    PiLangConceptProperty,
    PiLangEnumProperty,
    PiLangPrimitiveProperty,
    PiLangBinaryExpressionConcept,
    PiLangExpressionConcept,
    PiLanguageUnit, PiLangInterface
} from "../../metalanguage/PiLanguage";

export class InterfaceTemplate {
    constructor() {
    }

    generateInterface(concept: PiLangInterface, relativePath: string): string {
        const language = concept.language;
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? "extends " + Names.concept(concept.base.referedElement()) : "";
        const hasName = concept.primProperties.some(p => p.name === "name");
        // const abstract = (concept.isAbstract ? "abstract" : "");
        const abstract = '';

        const imports = Array.from(
            new Set(
                concept.parts.map(p => Names.concept(p.type.referedElement()))
                    .concat(concept.references.map(r => Names.concept(r.type.referedElement())))
                    .concat(language.enumerations.map(e => Names.enumeration(e)))
                    .concat(language.unions.map(e => Names.union(e)))
                    .concat(Names.concept(language.expressionPlaceholder()))
                    .filter(name => !(name === concept.name))
                    // .concat(element.properties.map(p => p.type).filter(t => language.enumerations.some(e => e.name === t)))
                    .concat((concept.base ? Names.concept(concept.base.referedElement()) : null))
                    .filter(r => r !== null)
            )
        );

        // Template starts here
        const result = `
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}
            
            export ${abstract} interface ${Names.concept(concept)} ${extendsClass} 
            {               
                ${concept.primProperties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${concept.enumProperties.map(p => this.generateEnumerationProperty(p)).join("")}
                ${concept.parts.map(p => this.generatePartProperty(p)).join("")}
                ${concept.references.map(p => this.generateReferenceProperty(p)).join("")}                         
            }`;
        return result;
    }

    generatePrimitiveProperty(property: PiLangPrimitiveProperty): string {
        return `
            ${property.name}: ${property.primType} ${property.isList ? "[]" : ""};
        `;
    }

    generateEnumerationProperty(property: PiLangEnumProperty): string {
        return `
            ${property.name}: ${Names.enumeration((property.type.referedElement()))} ${property.isList ? "[]" : `= ${Names.enumeration((property.type.referedElement()))}.$piANY;`};
        `;
    }

    generatePartProperty(property: PiLangConceptProperty): string {
        const arrayType = property.isList ? "[]" : "";
        const initializer = ((property.type.referedElement() instanceof PiLangExpressionConcept) ? `= ${property.isList ? "[" : ""} new ${Names.concept(property.owningConcept.language.expressionPlaceholder())} ${property.isList ? "]" : ""}` : "");
        return `
            ${property.name} : ${Names.concept(property.type.referedElement())}${arrayType} ${initializer};
        `;
    }

    generateReferenceProperty(property: PiLangConceptProperty): string {
        const arrayType = property.isList ? "[]" : "";
        return `
            ${property.name} : PiElementReference<${Names.concept(property.type.referedElement())}>${arrayType};
        `;
    }
}
