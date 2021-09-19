import { PiLanguage } from "../../metalanguage";
import { Names, PROJECTITCORE, LangUtil, typeToString } from "../../../utils";

export class LanguageTemplate {

    generateLanguage(language: PiLanguage, relativePath: string): string {
        return `import { Language, Property, Concept, Interface } from "${PROJECTITCORE}";
        
            import { ${language.concepts.map(concept =>
                `${Names.concept(concept)}`).join(", ") }, ${Names.PiElementReference} } from "./internal";
    
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
                Language.getInstance().addReferenceCreator( (name: string, type: string) => {
                    return (!!name ? PiElementReference.create(name, type) : null);
                });
            }
            
            ${language.concepts.map(concept =>
            `
                function describe${Names.concept(concept)}(): Concept {
                    const concept =             {
                        typeName: "${Names.concept(concept)}",
                        isModel: ${concept.isModel},
                        isUnit: ${concept.isUnit},
                        isAbstract: ${concept.isAbstract},
                        isPublic: ${concept.isPublic},
                        constructor: () => { return ${ concept.isAbstract ? "null" : `new ${Names.concept(concept)}()`}; },
                        properties: new Map< string, Property>(),
                        baseName: ${!!concept.base ? `"${Names.classifier(concept.base.referred)}"` : "null"},
                        subConceptNames: [${LangUtil.subConcepts(concept).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                    ${concept.allPrimProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${typeToString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "primitive"
                            });`
                    ).join("\n")}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type.referred)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "part"
                            });`
                    ).join("\n")}
                    ${concept.allReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type.referred)}",
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
                function describe${Names.interface(intface)}(): Interface {
                    const intface =             {
                        typeName: "${Names.interface(intface)}",
                        isPublic: ${intface.isPublic},
                        properties: new Map< string, Property>(),
                        subConceptNames: [${LangUtil.subConcepts(intface).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                ${intface.allPrimProperties().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${typeToString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "primitive"
                            });`
                ).join("\n")}
                ${intface.allParts().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type.referred)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyType: "part"
                            });`
                ).join("\n")}
                ${intface.allReferences().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type.referred)}",
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
