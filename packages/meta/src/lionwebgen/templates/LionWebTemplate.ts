import { LionWebJsonChunk, LionWebJsonNode, MetaPointers } from "@lionweb/validation";
import {
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaProperty,
    FreMetaUnitDescription
} from "../../languagedef/metalanguage/index.js";

export class LionWebTemplate {
    generate(language: FreMetaLanguage): string {
        const modelConcept = language.modelConcept;
        console.log(`Properties of model ${modelConcept.name} are ${language.modelConcept.properties.map(p => (!!p.id ? p.id : "unknown-child"))}`);
        const chunk: LionWebJsonChunk = {
            serializationFormatVersion: "2023.1",
            languages: [],
            nodes: []
        };
        const languageNode: LionWebJsonNode = {
            id: modelConcept.id,
            classifier: MetaPointers.Language,
            parent: null,
            properties: [],
            containments: [],
            references: [],
            annotations: []
        };

        languageNode.properties.push(...[
            {
                property: MetaPointers.INamedName,
                value: language.name
            },
            {
                property: MetaPointers.IKeyedKey,
                value: language.key
            },
            {
                property: MetaPointers.LanguageVersion,
                value: "version?"
            }
        ]);
        // language.parts().forEach(part => {
        languageNode.containments.push({
            containment: {
                language: "LionCore-M3",
                key: "Language-entities",
                version: "2023.1"
            },
            children: language.classifiers().map(cls => cls.id)
            // children: modelConcept.properties.concat(language.modelConcept.primProperties).map(part => (!!part.id ? part.id : "unknown-child"))
        });
        this.toLionWebLanguage(language);
        modelConcept.primProperties.filter(property => property.originalOwningClassifier === modelConcept).forEach(prop => {
            chunk.nodes.push(this.toLionWebProperty(prop, modelConcept.id));
        });
        // All references of thye concept are separate concepts in LionWeb
        modelConcept.references().filter(p => p.originalOwningClassifier === modelConcept).forEach(ref => {
            chunk.nodes.push(this.toLionWebReference(ref, modelConcept.id));
        });
        // All containments of thye concept are separate concepts in LionWeb
        modelConcept.parts().forEach(part => {
            chunk.nodes.push(this.toLionWebContainment(part, modelConcept.id));
            chunk.nodes.push();
        });

        // })
        language.units.forEach(unit => {
            chunk.nodes.push(this.toLionWebUnit(unit, modelConcept.id));
            // All primiytive properties of thye concept are separate concepts in LionWeb
            unit.primProperties.filter(property => property.originalOwningClassifier === unit).forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, unit.id));
            });
            // All references of thye concept are separate concepts in LionWeb
            unit.references().filter(p => p.originalOwningClassifier === unit).forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, unit.id));
            });
            // All containments of thye concept are separate concepts in LionWeb
            unit.parts().filter(p => p.originalOwningClassifier === unit).forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, unit.id));
                chunk.nodes.push();
            });
        });
        language.concepts.forEach(concept => {
            chunk.nodes.push(this.toLionWebConcept(concept));
            // All primitive properties of thye concept are separate concepts in LionWeb
            concept.primProperties.filter(property => property.originalOwningClassifier === concept).forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, concept.id));
            });
            // All references of thye concept are separate concepts in LionWeb
            concept.references().filter(p => p.originalOwningClassifier === concept).forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, concept.id));
            });
            // All containments of thye concept are separate concepts in LionWeb
            concept.parts().filter(p => p.originalOwningClassifier === concept).forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, concept.id));
                chunk.nodes.push();
            });
        });
        language.interfaces.forEach(intface => {
            chunk.nodes.push(this.toLionWebInterface(intface, language.id));
            if (intface.name === "BaseType") {
                console.log("BaseType: " + intface.primProperties.map(p => p.name));
                console.log("BaseType: " + intface.allPrimProperties().map(p => p.name));
            }
            intface.primProperties.forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, intface.id));
            });
            // All references of thye concept are separate concepts in LionWeb
            intface.references().filter(p => p.originalOwningClassifier === intface).forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, intface.id));
            });
            // All containments of thye concept are separate concepts in LionWeb
            intface.parts().filter(p => p.originalOwningClassifier === intface).forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, intface.id));
                chunk.nodes.push();
            });
        });

        chunk.nodes.push(languageNode);

        const result = JSON.stringify(chunk, null, 2);
        // console.log("LANGUAGE LIONWEB\n" + result);
        return result;
    }

    toLionWebLanguage(language: FreMetaLanguage): LionWebJsonNode {
        const modelConcept = language.modelConcept;
        return {
            id: modelConcept.id,
            classifier: MetaPointers.Language,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: modelConcept.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: modelConcept.key
                },
                {
                    property: MetaPointers.LanguageVersion,
                    value: "version?"
                }
            ],
            containments: [
                {
                    containment: MetaPointers.ClassifierFeatures,
                    children: modelConcept.properties.concat(modelConcept.primProperties)
                        .filter(p => p.originalOwningClassifier === modelConcept).map(part => (!!part.id ? part.id : "unknown-child"))
                }
            ],
            annotations: [],
            references: [],
            parent: "-id-LionCore-M3"
        };
    }

    toLionWebUnit(unit: FreMetaUnitDescription, parentId: string): LionWebJsonNode {
        return {
            id: unit.id,
            classifier: MetaPointers.Concept,
            properties: [
                {
                    property: MetaPointers.ConceptAbstract,
                    value: `false`
                },
                {
                    property: MetaPointers.ConceptPartition,
                    value: `true`
                },
                {
                    property: MetaPointers.INamedName,
                    value: unit.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: unit.key
                }
            ],
            containments: [
                {
                    containment: MetaPointers.ClassifierFeatures,
                    children: unit.properties.concat(unit.primProperties)
                        .filter(p => p.originalOwningClassifier === unit).map(part => (!!part.id ? part.id : "unknown-child"))
                }
            ],
            annotations: [],
            references: [
                {
                    reference: MetaPointers.ConceptImplements,
                    targets:
                        unit.interfaces.map(intface => {
                            return {
                                resolveInfo: intface.referred.name,
                                reference: intface.referred.id
                            };
                        })

                },
                {
                    reference: MetaPointers.ConceptExtends,
                    targets: []
                }
            ],
            parent: parentId
        };
    }

    toLionWebConcept(concept: FreMetaConcept): LionWebJsonNode {
        return {
            id: concept.id,
            classifier: MetaPointers.Concept,
            properties: [
                {
                    property: MetaPointers.ConceptAbstract,
                    value: `${concept.isAbstract}`
                },
                {
                    property: MetaPointers.ConceptPartition,
                    value: `false`
                },
                {
                    property: MetaPointers.INamedName,
                    value: concept.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: concept.key
                }
            ],
            containments: [
                {
                    containment: MetaPointers.ClassifierFeatures,
                    children: concept.properties.concat(concept.primProperties)
                        .filter(p => p.originalOwningClassifier === concept).map(part => (!!part.id ? part.id : "unknown-child"))
                }
            ],
            annotations: [],
            references: [
                {
                    reference: MetaPointers.ConceptImplements,
                    targets:
                        concept.interfaces.map(intface => {
                            return {
                                resolveInfo: intface.referred.name,
                                reference: intface.referred.id
                            };
                        })

                },
                {
                    reference: MetaPointers.ConceptExtends,
                    targets: (concept.base ? [
                        {
                            resolveInfo: concept.base.referred.name,
                            reference: concept.base.referred.id
                        }
                    ] : [])
                }
            ],
            parent: "-id-LionCore-M3"
        };
    }

    toLionWebProperty(prop: FreMetaProperty, parentId: string): LionWebJsonNode {
        return {
            id: (prop.id ? prop.id : "propd id unknown"),
            classifier: MetaPointers.Property,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: prop.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: (prop.key ? prop.key : "prop-key undefined")
                },
                {
                    property: {
                        language: "LionCore-M3",
                        key: "Feature-optional",
                        version: "2023.1"
                    },
                    value: `${"" + prop.isOptional}`
                }
            ],
            containments: [],
            annotations: [],
            references: [
                {
                    reference: MetaPointers.PropertyType,
                    targets: [
                        {
                            resolveInfo: prop.type.name,
                            // @ts-ignore
                            reference: (prop.type.id === "" ? null : prop.type.id)
                        }
                    ]
                }
            ],
            parent: parentId
        };
    }

    toLionWebContainment(part: FreMetaConceptProperty, parentId: string): LionWebJsonNode {
        return {
            id: (part.id ? part.id : "part id unknown"),
            classifier: MetaPointers.Containment,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: part.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: (part.key ? part.key : "prop-key undefined")
                },
                {
                    property: {
                        language: "LionCore-M3",
                        key: "Link-multiple",
                        version: "2023.1"
                    },
                    value: `${part.isList}`
                },
                {
                    property: {
                        language: "LionCore-M3",
                        key: "Feature-optional",
                        version: "2023.1"
                    },
                    value: `${part.isOptional}`
                }
            ],
            containments: [],
            annotations: [],
            references: [
                {
                    reference: { 
                        key: "Link-type",
                        language: "LionCore-M3",
                        version: "2023.1"
                    },
                    targets: [
                        {
                            resolveInfo: part.type.name,
                            reference: part.type.id
                        }
                    ]
                }
            ],
            parent: parentId
        };
    }

    toLionWebReference(ref: FreMetaConceptProperty, parentId: string): LionWebJsonNode {
        return {
            id: (ref.id ? ref.id : "propd id unknown"),
            classifier: MetaPointers.Reference,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: ref.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: (ref.key ? ref.key : "prop-key undefined")
                },
                {
                    property: {
                        language: "LionCore-M3",
                        key: "Link-multiple",
                        version: "2023.1"
                    },
                    value: `${ref.isList}`
                },
                {
                    property: {
                        language: "LionCore-M3",
                        key: "Feature-optional",
                        version: "2023.1"
                    },
                    value: `${"" + ref.isOptional}`
                }

            ],
            containments: [],
            annotations: [],
            references: [
                {
                    reference: {
                        key: "Link-type",
                        language: "LionCore-M3",
                        version: "2023.1"
                    },
                    targets: [
                        {
                            resolveInfo: ref.type.name,
                            reference: ref.type.id
                        }
                    ]
                }
            ],
            parent: parentId
        };
    }

    toLionWebInterface(intface: FreMetaInterface, parentId: string): LionWebJsonNode {
        const result: LionWebJsonNode = {
            id: intface.id,
            classifier: MetaPointers.Interface,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: intface.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: intface.key
                }
            ],
            containments: [
                {
                    containment: MetaPointers.ClassifierFeatures,
                    children: intface.properties.concat(intface.primProperties)
                        .filter(p => p.originalOwningClassifier === intface).map(part => (!!part.id ? part.id : "unknown-child"))
                }

            ],
            annotations: [],
            references: [
                {
                    reference: MetaPointers.InterfaceExtends,
                    targets:
                        intface.base.map(baseIntface => {
                            return {
                                resolveInfo: baseIntface.name,
                                reference: baseIntface.referred.id
                            };
                        })

                }

            ],
            parent: parentId
        };
        return result;
    }
}
