import { FreMetaLanguage } from "../../metalanguage";
import { Names, FREON_CORE, LangUtil, GenerationUtil, STDLIB_GEN_FOLDER } from "../../../utils";

export class LanguageTemplate {

    generateLanguage(language: FreMetaLanguage, relativePath: string): string {
        return `import { ${Names.FreLanguage}, Model, ModelUnit, FreLanguageProperty, FreLanguageConcept, FreLanguageInterface, ${Names.FreNodeReference} } from "${FREON_CORE}";

            // Import as MyLanguage to avoid naming conflicts in generated constructors
            import * as MyLanguage from "./internal";
            import { ${Names.stdlib(language)} } from "${relativePath}${STDLIB_GEN_FOLDER}/${Names.stdlib(language)}";

            /**
             * Creates an in-memory representation of structure of the language metamodel, used in e.g. the (de)serializer.
             */
             export function initializeLanguage() {
                ${Names.FreLanguage}.getInstance().name = "${language.name}";
                ${Names.FreLanguage}.getInstance().id = ${language.id !== undefined ? `"${language.id}"` : `"${language.name}"`};
                ${Names.FreLanguage}.getInstance().addModel(describe${Names.classifier(language.modelConcept)}());
                ${language.units.map(concept =>
                    `${Names.FreLanguage}.getInstance().addUnit(describe${Names.classifier(concept)}());`
                ).join("\n")}
                ${language.concepts.map(concept =>
                    `${Names.FreLanguage}.getInstance().addConcept(describe${Names.concept(concept)}());`
                ).join("\n")}
                ${language.interfaces.map(intface =>
                    `${Names.FreLanguage}.getInstance().addInterface(describe${Names.interface(intface)}());`
                ).join("\n")}
                ${Names.FreLanguage}.getInstance().addReferenceCreator( (name: string, type: string) => {
                    return (!!name ? ${Names.FreNodeReference}.create(name, type) : null);
                });
                ${Names.FreLanguage}.getInstance().stdLib = ${Names.stdlib(language)}.getInstance();
            }

            function describe${Names.classifier(language.modelConcept)}(): Model {
                    const model =             {
                        typeName: "${Names.classifier(language.modelConcept)}",
                        isNamespace: true,
                        constructor: (id?: string) => { return new MyLanguage.${Names.classifier(language.modelConcept)}(id); },
                        properties: new Map< string, FreLanguageProperty>(),
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
                        id: "${modelunit.id}",
                        key: "${modelunit.key}",
                        isNamedElement: true,
                        fileExtension: "${modelunit.fileExtension}",
                        subConceptNames: [], // Nothing yet, but may change in the future
                        constructor: (id?: string) => { return new MyLanguage.${Names.classifier(modelunit)}(id); },
                        properties: new Map< string, FreLanguageProperty>(),
                    }
                    ${modelunit.allPrimProperties().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        id: "${prop.id}",
                                        key: "${prop.key}",
                                        type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "primitive"
                                    });`
                    ).join("\n")}
                            ${modelunit.allParts().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        id: "${prop.id}",
                                        key: "${prop.key}",
                                        type: "${Names.classifier(prop.type)}",
                                        isList: ${prop.isList},
                                        isPublic: ${prop.isPublic},
                                        propertyKind: "part"
                                    });`
                    ).join("\n")}
                            ${modelunit.allReferences().map(prop =>
                        `modelunit.properties.set("${prop.name}", {
                                        name: "${prop.name}",
                                        id: "${prop.id}",
                                        key: "${prop.key}",
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
                function describe${Names.concept(concept)}(): FreLanguageConcept {
                    const concept =             {
                        typeName: "${Names.concept(concept)}",
                        id: "${concept.id}",
                        key: "${concept.key}",
                        isAbstract: ${concept.isAbstract},
                        isPublic: ${concept.isPublic},
                        isNamedElement: ${concept.allPrimProperties().some(p => p.name === "name")},
                        trigger: "${Names.concept(concept)}",
                        constructor: (id?: string) => { return ${ concept.isAbstract ? "null" : `new MyLanguage.${Names.concept(concept)}(id)`}; },
                        properties: new Map< string, FreLanguageProperty>(),
                        baseName: ${!!concept.base ? `"${Names.classifier(concept.base.referred)}"` : "null"},
                        subConceptNames: [${LangUtil.subConcepts(concept).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                    ${concept.allPrimProperties().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                id: "${prop.id}",
                                key: "${prop.key}",
                                type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "primitive"
                            });`
                    ).join("\n")}
                    ${concept.allParts().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                id: "${prop.id}",
                                key: "${prop.key}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "part"
                            });`
                    ).join("\n")}
                    ${concept.allReferences().map(prop =>
                        `concept.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                id: "${prop.id}",
                                key: "${prop.key}",
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
                function describe${Names.interface(intface)}(): FreLanguageInterface {
                    const intface =             {
                        typeName: "${Names.interface(intface)}",
                        key: "${intface.key}",
                        isPublic: ${intface.isPublic},
                        isNamedElement: ${intface.allPrimProperties().some(p => p.name === "name")},
                        properties: new Map< string, FreLanguageProperty>(),
                        subConceptNames: [${LangUtil.subConcepts(intface).map(sub => "\"" + Names.classifier(sub) + "\"").join(", ")}]
                    }
                ${intface.allPrimProperties().map(prop =>
                `intface.properties.set("${prop.name}", {
                                id: "${prop.id}",
                                name: "${prop.name}",
                                key: "${prop.key}",
                                type: "${GenerationUtil.getBaseTypeAsString(prop)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "primitive"
                            });`
                ).join("\n")}
                ${intface.allParts().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                id: "${prop.id}",
                                key: "${prop.key}",
                                type: "${Names.classifier(prop.type)}",
                                isList: ${prop.isList},
                                isPublic: ${prop.isPublic},
                                propertyKind: "part"
                            });`
                ).join("\n")}
                ${intface.allReferences().map(prop =>
                `intface.properties.set("${prop.name}", {
                                name: "${prop.name}",
                                id: "${prop.id}",
                                key: "${prop.key}",
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
