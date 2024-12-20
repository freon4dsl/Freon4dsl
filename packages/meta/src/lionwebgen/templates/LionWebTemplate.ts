import { LanguageRegistry, LionWebJsonChunk, LionWebJsonNode, LionWebValidator, MetaPointers } from "@lionweb/validation";
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaConceptProperty, FreMetaInstance,
    FreMetaInterface,
    FreMetaLanguage, FreMetaLimitedConcept,
    FreMetaProperty,
    FreMetaUnitDescription, MetaElementReference
} from "../../languagedef/metalanguage/index.js";
import { LOG2USER } from "../../utils/index.js";

export class LionWebTemplate {

    generate(language: FreMetaLanguage): string {
        const modelConcept = language.modelConcept;
        // console.log(`Properties of model ${modelConcept.name} are ${language.modelConcept.properties.map(p => (!!p.id ? p.id : "unknown-child"))}`);
        const chunk: LionWebJsonChunk = {
            serializationFormatVersion: "2023.1",
            languages: [
                {
                    key: "LionCore-M3",
                    version: "2023.1"
                },
                {
                    key: "LionCore-builtins",
                    version: "2023.1"
                }
            ],
            nodes: []
        };
        chunk.nodes.push(this.toLionWebLanguage(language));

        language.units.forEach(unit => {
            chunk.nodes.push(this.toLionWebUnit(unit, modelConcept));
            // All primitive properties of thye concept are separate concepts in LionWeb
            const properties = unit.primProperties.filter(property => property.originalOwningClassifier === unit);
            // console.log(`Unit ${unit.name} properties ${properties.map(p => p.name)}`);
            properties.forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, unit));
            });
            // All references of thye concept are separate concepts in LionWeb 
            const references = unit.references().filter(p => p.originalOwningClassifier === unit);
            // console.log(`Unit ${unit.name} references ${references.map(p => p.name)}`);
            references.forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, unit));
            });
            // All containments of thye concept are separate concepts in LionWeb
            const parts = unit.parts().filter(p => p.originalOwningClassifier === unit);
            // console.log(`Unit ${unit.name} parts ${parts.map(p => p.name)}`);
            parts.forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, unit));
                chunk.nodes.push();
            });
        });
        language.concepts.filter(c => !(c instanceof FreMetaLimitedConcept)).forEach(concept => {
            chunk.nodes.push(this.toLionWebConcept(concept, modelConcept));
            // All primitive properties of thye concept are separate concepts in LionWeb
            concept.primProperties.filter(property => property.originalOwningClassifier === concept).forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, concept));
            });
            // All references of thye concept are separate concepts in LionWeb
            concept.references().filter(p => p.originalOwningClassifier === concept).forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, concept));
            });
            // All containments of thye concept are separate concepts in LionWeb
            concept.parts().filter(p => p.originalOwningClassifier === concept).forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, concept));
            })
        })
        language.concepts.filter(c => (c instanceof FreMetaLimitedConcept)).forEach(concept => {
            const limited = concept as FreMetaLimitedConcept
            chunk.nodes.push(this.toLionWebEnumeration(limited, modelConcept))
            limited.instances.forEach(literal => {
                chunk.nodes.push(this.toLionWebEnumerationLiteral(literal, limited))
            })            
        })
        language.interfaces.forEach(intface => {
            chunk.nodes.push(this.toLionWebInterface(intface, modelConcept));
            intface.primProperties.forEach(prop => {
                chunk.nodes.push(this.toLionWebProperty(prop, intface));
            });
            // All references of thye concept are separate concepts in LionWeb
            intface.references().filter(p => p.originalOwningClassifier === intface).forEach(ref => {
                chunk.nodes.push(this.toLionWebReference(ref, intface));
            });
            // All containments of thye concept are separate concepts in LionWeb
            intface.parts().filter(p => p.originalOwningClassifier === intface).forEach(part => {
                chunk.nodes.push(this.toLionWebContainment(part, intface));
                chunk.nodes.push();
            });
        });

        const lionWebValidator = new LionWebValidator(chunk, new LanguageRegistry())
        // JUST MAKING SURE THAT THE CHUNK IS WELL-FORMED
        lionWebValidator.validateSyntax()
        lionWebValidator.validateReferences()
        if (lionWebValidator.validationResult.hasErrors()) {
            lionWebValidator.validationResult.issues.forEach(issue =>
                LOG2USER.warning(`LionWeb language error: ${issue.errorMsg()}`)
            )
        } else {
            LOG2USER.warning("Generated LionWeb language chunk is validated ok")
        }
        const result = JSON.stringify(chunk, null, 2);
        return result;
    }

    /**
     * Freon language maps to LionWeb Language
     * The Freon _Model_ does not exist in LionWeb, we use that for the name and id of the language
     * @param language
     */
    toLionWebLanguage(language: FreMetaLanguage): LionWebJsonNode {
        const modelConcept = language.modelConcept;
        const allClassifiers = language.conceptsAndInterfaces().concat(language.units).map(c => c.id);
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
                },
                {
                    containment: {
                        key: "Language-entities",
                        language: "LionCore-M3",
                        version: "2023.1"
                    },
                    children: allClassifiers
                }
            ],
            annotations: [],
            references: [],
            parent: null
        };
    }

    /**
     * A Freon Model Unit maps to a LionWeb concept with partition = true
     * @param unit
     * @param parentId
     */
    toLionWebUnit(unit: FreMetaUnitDescription, parent: FreMetaClassifier): LionWebJsonNode {
        const features = unit.properties.concat(unit.primProperties)
            .filter(p => p.originalOwningClassifier === unit).map(part => (!!part.id ? part.id : "unknown-child"));
        // console.log(`toLionWebUnit ${unit.name} features ${features}`);
        return this.toConcept({
            id: unit.id,
            abstract: false,
            partition: true,
            name: unit.name,
            key: unit.key,
            features: features,
            implements: unit.interfaces,
            extends: [],
            parentId: parent.id
        });
    }

    /**
     * A Freon Concept maps to a LionWeb concept with partition = false
     * @param conceptDefinition
     */
    toConcept(conceptDefinition: ToConcept): LionWebJsonNode {
        return {
            id: conceptDefinition.id,
            classifier: MetaPointers.Concept,
            properties: [
                {
                    property: MetaPointers.ConceptAbstract,
                    value: "" + conceptDefinition.abstract
                },
                {
                    property: MetaPointers.ConceptPartition,
                    value: "" + conceptDefinition.partition
                },
                {
                    property: MetaPointers.INamedName,
                    value: conceptDefinition.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: conceptDefinition.key
                }
            ],
            containments: [
                {
                    containment: MetaPointers.ClassifierFeatures,
                    children: conceptDefinition.features
                }
            ],
            annotations: [],
            references: [
                {
                    reference: MetaPointers.ConceptImplements,
                    targets:
                        conceptDefinition.implements.map(intface => {
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
            parent: conceptDefinition.parentId
        };
    }

    /**
     * A Freon Concept maps to a LionWeb Concept
     * @param concept
     * @param parent
     */
    toLionWebConcept(concept: FreMetaConcept, parent: FreMetaClassifier): LionWebJsonNode {
        const features = concept.properties.concat(concept.primProperties)
            .filter(p => p.originalOwningClassifier === concept).map(part => (!!part.id ? part.id : "unknown-child"));
        // console.log(`toLionWebConcept ${concept.name} features ${features}`);
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
                    children: features
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
            parent: parent.id
        };
    }

    /**
     * A Freon Property maps to a LionWeb Property
     * @param prop
     * @param parent
     */
    toLionWebProperty(prop: FreMetaProperty, parent: FreMetaClassifier): LionWebJsonNode {
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
            parent: parent.id
        };
    }

    /**
     * A Freon Part Property maps to a LionWeb Containment
     * @param part
     * @param parent
     */
    toLionWebContainment(part: FreMetaConceptProperty, parent: FreMetaClassifier): LionWebJsonNode {
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
            parent: parent.id
        };
    }

    /**
     * A Freon Reference Property maps to a LionWeb Reference
     * @param ref
     * @param parent
     */
    toLionWebReference(ref: FreMetaConceptProperty, parent: FreMetaClassifier): LionWebJsonNode {
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
            parent: parent.id
        };
    }

    toLionWebInterface(intface: FreMetaInterface, parent: FreMetaClassifier): LionWebJsonNode {
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
            parent: parent.id
        };
        return result;
    }

    /**
     * A Freon Concept maps to a LionWeb Concept
     * @param concept
     * @param parent
     */
    toLionWebEnumeration(limitedConcept: FreMetaLimitedConcept, parent: FreMetaClassifier): LionWebJsonNode {
        const result: LionWebJsonNode = {
            id: limitedConcept.id,
            classifier: MetaPointers.Enumeration,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: limitedConcept.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: limitedConcept.key
                }
            ],
            containments: [
                {
                    containment: MetaPointers.EnumerationLiterals,
                    children: limitedConcept.instances.map(inst => (!!inst.name ? "-id-" + inst.name : "unknown-child"))
                }
            ],
            annotations: [],
            references: [],
            parent: parent.id
        };
        return result;
    }
    toLionWebEnumerationLiteral(instance: FreMetaInstance, parent: FreMetaClassifier): LionWebJsonNode {
        const result: LionWebJsonNode = {
            id: "-id-" + instance.name,
            classifier: MetaPointers.EnumerationLiteral,
            properties: [
                {
                    property: MetaPointers.INamedName,
                    value: instance.name
                },
                {
                    property: MetaPointers.IKeyedKey,
                    value: "-key-" + instance.name
                }
            ],
            containments: [],
            annotations: [],
            references: [],
            parent: parent.id
        };
        return result;
    }
}

type ToConcept = {
    id: string,
    abstract: boolean,
    partition: boolean,
    name: string,
    key: string,
    features: string[],
    implements:  MetaElementReference<FreMetaInterface>[],
    extends: string[],
    parentId: string
}
