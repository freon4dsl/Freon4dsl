import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import {
    PiLangConceptProperty,
    PiLangEnumProperty,
    PiLangPrimitiveProperty,
    PiLangBinaryExpressionConcept,
    PiLangExpressionConcept,
    PiLangClass,
    PiLanguageUnit
} from "../../metalanguage/PiLanguage";
import * as os from 'os';

export class LanguageTemplate {
    constructor() {
    }

    generateLanguage(language: PiLanguageUnit, relativePath: string): string {
        return `import { Language, Property, Concept, Enumeration } from "@projectit/core";
        
            ${language.classes.map(concept =>
                `import { ${Names.concept(concept)} } from "./${Names.concept(concept)}";`
            ).join(os.EOL)}
            ${language.enumerations.map(enu =>
                `import { ${Names.enumeration(enu)} } from "./${Names.enumeration(enu)}";`
            ).join(os.EOL)}
            import { PiElementReference } from "./PiElementReference";
    
            export function initializeLanguage() {
                ${language.classes.map(concept =>
                    `Language.getInstance().addConcept(describe${Names.concept(concept)}());`
                ).join(os.EOL)}
                ${language.enumerations.map(enu =>
                    `Language.getInstance().addEnumeration(describe${Names.enumeration(enu)}());`
                ).join(os.EOL)}
                Language.getInstance().addReferenceCreator( (name: string, type: string) => { return PiElementReference.createNamed(name, type)});
            }
            
            ${language.classes.map(concept =>
            `
                function describe${concept.name}(): Concept {
                    const concept =             {
                        typeName: "${Names.concept(concept)}",
                        constructor: () => { return ${ concept.isAbstract ? "null" : `new ${Names.concept(concept)}()`}; },
                        properties: new Map< string, Property>(),
                        baseNames: null
                    }
                    ${concept.allPrimProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.primType}",
                                isList: ${prop.isList} ,
                                propertyType: "primitive"
                            });`
                    ).join(os.EOL)}
                    ${concept.allEnumProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList} ,
                                propertyType: "enumeration"
                            });`
                    ).join(os.EOL)}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList} ,
                                propertyType: "part"
                            });`
                    ).join(os.EOL)}
                    ${concept.allPReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList} ,
                                propertyType: "reference"
                            });`
                    ).join(os.EOL)}
                return concept;
            }`
            ).join(os.EOL)}
            ${language.enumerations.map(enu =>
            `function describe${enu.name}(): Enumeration {
                            const enumeration =             {
                                typeName: "${Names.enumeration(enu)}",
                                literal: (literal: string) => { return ${Names.enumeration(enu)}.fromString(literal); }
                            }
                            return enumeration;
                        }`
        ).join(os.EOL)}
        `;
    }
}
