import { Names } from "../../../utils/Names";
import { PiLangUtil } from "../../metalanguage";
import {
    PiLanguageUnit
} from "../../metalanguage/PiLanguage";
import { PROJECTITCORE } from "../../../utils";

export class LanguageTemplate {
    constructor() {
    }

    generateLanguage(language: PiLanguageUnit, relativePath: string): string {
        return `import { Language, Property, Concept, Interface } from "${PROJECTITCORE}";
        
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
                ${language.interfaces.map(intface =>
                    `Language.getInstance().addInterface(describe${Names.interface(intface)}());`
                ).join("\n")}
                Language.getInstance().addReferenceCreator( (name: string, type: string) => { return PiElementReference.createNamed(name, type)});
            }
            
            ${language.concepts.map(concept =>
            `
                function describe${concept.name}(): Concept {
                    const concept =             {
                        typeName: "${Names.concept(concept)}",
                        isAbstract: ${concept.isAbstract},
                        isPublic: ${concept.isPublic},
                        constructor: () => { return ${ concept.isAbstract ? "null" : `new ${Names.concept(concept)}()`}; },
                        properties: new Map< string, Property>(),
                        baseName: ${!!concept.base ? `"${concept.base.name}"` : "null"},
                        subConceptNames: [${PiLangUtil.subConcepts(concept).map(sub => "\"" + sub.name+ "\"").join(", ")}]
                    }
                    ${concept.allPrimProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.primType}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "primitive"
                            });`
                    ).join("\n")}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "part"
                            });`
                    ).join("\n")}
                    ${concept.allReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "reference"
                            });`
                    ).join("\n")}
                return concept;
            }`
            ).join("\n")}
            ${language.interfaces.map(intface =>
            `
                function describe${intface.name}(): Interface {
                    const intface =             {
                        typeName: "${Names.interface(intface)}",
                        isPublic: ${intface.isPublic},
                        properties: new Map< string, Property>(),
                        subConceptNames: [${PiLangUtil.subConcepts(intface).map(sub => "\"" + sub.name+ "\"").join(", ")}]
                    }
                ${intface.allPrimProperties().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.primType}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "primitive"
                            });`
                ).join("\n")}
                ${intface.allParts().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "part"
                            });`
                ).join("\n")}
                ${intface.allReferences().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${prop.type.name}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "reference"
                            });`
                ).join("\n")}
                return intface;
            }`
        ).join("\n")}
        `;
    }
}
