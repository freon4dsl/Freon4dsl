import { Names } from "../../../utils/Names";
import {
    PiLanguageUnit
} from "../../metalanguage/PiLanguage";
import { PROJECTITCORE } from "../../../utils";

export class LanguageTemplate {
    constructor() {
    }

    generateLanguage(language: PiLanguageUnit, relativePath: string): string {
        return `import { Language, Property, Concept, Enumeration } from "${PROJECTITCORE}";
        
            ${language.concepts.map(concept =>
                `import { ${Names.concept(concept)} } from "./${Names.concept(concept)}";`
            ).join("\n")}
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
    
            /**
             * Creates an in-memory representation of structure of the language metamodel, used in e.g. the (de)serializer.
             */
             export function initializeLanguage() {
                ${language.concepts.map(concept =>
                    `Language.getInstance().addConcept(describe${Names.concept(concept)}());`
                ).join("\n")}
                Language.getInstance().addReferenceCreator( (name: string, type: string) => { return PiElementReference.createNamed(name, type)});
            }
            
            ${language.concepts.map(concept =>
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
                    ).join("\n")}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList} ,
                                propertyType: "part"
                            });`
                    ).join("\n")}
                    ${concept.allReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList} ,
                                propertyType: "reference"
                            });`
                    ).join("\n")}
                return concept;
            }`
            ).join("\n")}
        `;
    }
}
