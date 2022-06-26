import { PiLanguage } from "../../metalanguage";
import { Names, PROJECTITCORE, LangUtil, GenerationUtil } from "../../../utils";

export class LanguageTemplate {

    generateLanguage(language: PiLanguage): string {
        return `import { Language, Model, ModelUnit, Property, Concept, Interface, ${Names.PiElementReference} } from "${PROJECTITCORE}";
        
            import { ${Names.classifier(language.modelConcept)}, ${language.units.map(unit =>
            `${Names.classifier(unit)}`).join(", ") }, ${language.concepts.map(concept =>
                `${Names.concept(concept)}`).join(", ")} } from "./internal";
    
            /**
             * Creates an in-memory representation of structure of the language metamodel, used in e.g. the (de)serializer.
             */
             export function initializeLanguage() {
                Language.getInstance().name = "${language.name}";
                Language.getInstance().addModel(describe${Names.classifier(language.modelConcept)}());
                ${language.units.map(concept =>
                    `Language.getInstance().addUnit(describe${Names.classifier(concept)}());`
                ).join("\n")}
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

            function describe${Names.classifier(language.modelConcept)}(): Model {
                    const model =             {
                        typeName: "${Names.classifier(language.modelConcept)}",
                        isNamespace: true,
                        constructor: () => { return new ${Names.classifier(language.modelConcept)}(); },
                        properties: new Map< string, Property>(),
                    }
                    ${language.modelConcept.allPrimProperties().map(prop =>
                        `model.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "primitive"
                                    });`
                    ).join("\n")}
                    ${language.modelConcept.allParts().map(prop =>
                        `model.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${Names.classifier(prop.type)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "part"
                                    });`
                    ).join("\n")}
                    ${language.modelConcept.allReferences().map(prop =>
                        `model.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${Names.classifier(prop.type)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "reference"
                                    });`
                       ).join("\n")}
                        return model;
                    }

            ${language.units.map(modelunit =>
            `
                function describe${Names.classifier(modelunit)}(): ModelUnit {
                    const modelunit =             {
                        typeName: "${Names.classifier(modelunit)}",
                        isNamedElement: true,
                        fileExtension: "${modelunit.fileExtension}",
                        constructor: () => { return new ${Names.classifier(modelunit)}(); },
                        properties: new Map< string, Property>(),
                    }
                    ${modelunit.allPrimProperties().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "primitive"
                                    });`
                    ).join("\n")}
                            ${modelunit.allParts().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${Names.classifier(prop.type)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "part"
                                    });`
                    ).join("\n")}
                            ${modelunit.allReferences().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        type: "${Names.classifier(prop.type)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "reference"
                                    });`
                    ).join("\n")}
                        return modelunit;
                    }`
                ).join("\n")}
            
            ${language.concepts.map(concept =>
            `
                function describe${Names.concept(concept)}(): Concept {
                    const concept =             {
                        typeName: "${Names.concept(concept)}",
                        isAbstract: ${concept.isAbstract},
                        isPublic: ${concept.isPublic},
                        isNamedElement: ${concept.allPrimProperties().some(p => p.name === "name")},
                        trigger: "${Names.concept(concept)}",
                        constructor: () => { return ${ concept.isAbstract ? "null" : `new ${Names.concept(concept)}()`}; },
                        properties: new Map< string, Property>(),
                        baseName: ${!!concept.base ? `"${Names.classifier(concept.base.referred)}"` : "null"},
                        subConceptNames: [${LangUtil.subConcepts(concept).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                    ${concept.allPrimProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "primitive"
                            });`
                    ).join("\n")}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "part"
                            });`
                    ).join("\n")}
                    ${concept.allReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "reference"
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
                        isNamedElement: ${intface.allPrimProperties().some(p => p.name === "name")},
                        properties: new Map< string, Property>(),
                        subConceptNames: [${LangUtil.subConcepts(intface).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                ${intface.allPrimProperties().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "primitive"
                            });`
                ).join("\n")}
                ${intface.allParts().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "part"
                            });`
                ).join("\n")}
                ${intface.allReferences().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "reference"
                            });`
                ).join("\n")}
                return intface;
            }`
        ).join("\n")}
        `;
    }
}
