import type {
    FreMetaConcept,
    FreMetaLanguage,
    FreMetaProperty} from "../../../languagedef/metalanguage/index.js";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaLimitedConcept
} from "../../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../../utils/on-lang/index.js";
import { LOG2USER } from "../../../utils/basic-dependencies/index.js";
import { isNullOrUndefined } from "../../../utils/file-utils/index.js";
import { NamesForEditor } from "../../../utils/on-lang-and-editor/index.js";
import type {
    FreEditExtraClassifierInfo,
    FreEditClassifierProjection,
    FreEditProjectionGroup,
    FreEditPropertyProjection,
    FreEditTableProjection,
    FreEditUnit} from "../../metalanguage/index.js";
import {
    FreEditNormalProjection
} from "../../metalanguage/index.js";

export class EditorDefTemplate {
    generateEditorDef(language: FreMetaLanguage, editorDef: FreEditUnit, customsFolder: string, relativePath: string): string {
        const defaultProjGroup: FreEditProjectionGroup | undefined = editorDef.getDefaultProjectiongroup();
        if (defaultProjGroup === null || defaultProjGroup === undefined) {
            // this should never happen
            LOG2USER.error("No default projection group found.");
            return "";
        }

        const conceptsWithTrigger: ConceptTriggerElement[] = [];
        const conceptsWithRefShortcut: ConceptShortCutElement[] = [];
        const imports = new Imports(relativePath)
        // const languageImports: string[] = [];
        // const editorImports: string[] = [];
        imports.core.add(Names.FreLanguage).add("FreProjectionHandler").add("FreBoxProvider").add("FreLanguageConcept");

        language.concepts
            .filter((c) => !(c instanceof FreMetaLimitedConcept || c.isAbstract))
            .forEach((concept) => {
                // TODO handle other sub types of FreClassifier
                // find the triggers for all concepts
                const extras: FreEditExtraClassifierInfo | undefined = defaultProjGroup.findExtrasForType(concept);
                if (!!extras) {
                    const trigger: string = extras.trigger;
                    if (!!trigger && trigger.length > 0) {
                        conceptsWithTrigger.push(new ConceptTriggerElement(concept, trigger));
                    }

                    // find concepts with reference shortcuts
                    const referenceShortCut: FreMetaProperty | undefined = extras.referenceShortCut?.referred;
                    if (!!referenceShortCut) {
                        conceptsWithRefShortcut.push(new ConceptShortCutElement(concept, referenceShortCut));
                    }
                    imports.language.add(Names.concept(concept));
                }
            });

        const handlerVarName: string = "handler";
        // get all the constructors
        const constructors: string[] = [];
        language.concepts.forEach((concept) => {
            if (!(concept instanceof FreMetaLimitedConcept) && !concept.isAbstract) {
                constructors.push(`["${Names.concept(concept)}", () => {
                        return new ${NamesForEditor.boxProvider(concept)}(${handlerVarName})
                    }]`);
                imports.editor.add(NamesForEditor.boxProvider(concept));
            }
        });
        language.units.forEach((unit) => {
            constructors.push(`["${Names.classifier(unit)}", () => {
                        return new ${NamesForEditor.boxProvider(unit)}(${handlerVarName})
                    }]`);
            imports.editor.add(NamesForEditor.boxProvider(unit));
        });

        // get all the table header info
        const tableHeaderInfo: string[] = [];
        language.concepts.forEach((concept) => {
            editorDef.findTableProjectionsForType(concept).map((proj) => {
                const entry = this.generateHeaderInfo(proj, imports);
                if (!!entry && entry.length > 0) {
                    tableHeaderInfo.push(entry);
                }
            });
        });

        // Get all special child projections for a concept: tables or named
        const conceptProjectionToPropertyProjection: Map<string, Map<string, Map<string, string>>> = new Map<
            string,
            Map<string, Map<string, string>>
        >();
        language.classifiers().forEach((concept) => {
            editorDef.findProjectionsForType(concept).forEach((conceptProjection: FreEditClassifierProjection) => {
                if (conceptProjection instanceof FreEditNormalProjection) {
                    const partProjections: FreEditPropertyProjection[] = conceptProjection.findAllPartProjections();
                    partProjections
                        .filter((pp: FreEditPropertyProjection) => !isNullOrUndefined(pp.projectionName))
                        .forEach((p: FreEditPropertyProjection) => {
                            let conceptMap = conceptProjectionToPropertyProjection.get(concept.name);
                            if (conceptMap === undefined) {
                                conceptMap = new Map<string, Map<string, string>>();
                                conceptProjectionToPropertyProjection.set(concept.name, conceptMap);
                            }
                            let projectionMap = conceptMap.get(conceptProjection.name);
                            if (projectionMap === undefined) {
                                projectionMap = new Map<string, string>();
                                conceptMap.set(conceptProjection.name, projectionMap);
                            }
                            if (p.property !== undefined) {
                                projectionMap.set(p.property.name, p.projectionName);
                            }
                        });
                    partProjections
                        .filter((pp) => !isNullOrUndefined(pp.listInfo) && pp.listInfo.isTable)
                        .forEach((p) => {
                            let conceptMap = conceptProjectionToPropertyProjection.get(concept.name);
                            if (conceptMap === undefined) {
                                conceptMap = new Map<string, Map<string, string>>();
                                conceptProjectionToPropertyProjection.set(concept.name, conceptMap);
                            }
                            let projectionMap = conceptMap.get(conceptProjection.name);
                            if (projectionMap === undefined) {
                                projectionMap = new Map<string, string>();
                                conceptMap.set(conceptProjection.name, projectionMap);
                            }
                            if (p.property !== undefined) {
                                projectionMap.set(p.property.name, "__TABLE__");
                            }
                        });
                }
            });
            // TODO Might refactor this with almost the same code above.
            editorDef.findTableProjectionsForType(concept).forEach((conceptProjection) => {
                const partProjections: FreEditPropertyProjection[] = conceptProjection.findAllPartProjections();
                partProjections
                    .filter((pp) => !isNullOrUndefined(pp.projectionName))
                    .forEach((p) => {
                        let conceptMap = conceptProjectionToPropertyProjection.get(concept.name);
                        if (conceptMap === undefined) {
                            conceptMap = new Map<string, Map<string, string>>();
                            conceptProjectionToPropertyProjection.set(concept.name, conceptMap);
                        }
                        let projectionMap = conceptMap.get(conceptProjection.name);
                        if (projectionMap === undefined) {
                            projectionMap = new Map<string, string>();
                            conceptMap.set(conceptProjection.name, projectionMap);
                        }
                        if (p.property !== undefined) {
                            projectionMap.set(p.property.name, p.projectionName);
                        }
                    });
                partProjections
                    .filter((pp) => !isNullOrUndefined(pp.listInfo) && pp.listInfo.isTable)
                    .forEach((p) => {
                        let conceptMap = conceptProjectionToPropertyProjection.get(concept.name);
                        if (conceptMap === undefined) {
                            conceptMap = new Map<string, Map<string, string>>();
                            conceptProjectionToPropertyProjection.set(concept.name, conceptMap);
                        }
                        let projectionMap = conceptMap.get(conceptProjection.name);
                        if (projectionMap === undefined) {
                            projectionMap = new Map<string, string>();
                            conceptMap.set(conceptProjection.name, projectionMap);
                        }
                        if (p.property !== undefined) {
                            projectionMap.set(p.property.name, "__TABLE__");
                        }
                    });
            });
        });

        const hasBinExps: boolean =
            language.concepts.filter((c) => c instanceof FreMetaBinaryExpressionConcept).length > 0;
        // todo In what order do we add the projections?  Maybe custom should be last in stead of first?

        // template starts here
        return `    // TEMPLATE: EditorDefTemplate.generateEditorDef(...)
            ${imports.makeImports(language)}
            import { freonConfiguration } from "${relativePath}/${customsFolder}/${Names.configuration}.js";

            const map = ${conceptProjectionToPropertyProjectionText(conceptProjectionToPropertyProjection)};

            /**
             * Adds all known projection groups to the root projection.
             * @param ${handlerVarName}
             */
            export function initializeProjections(${handlerVarName}: FreProjectionHandler) {
                ${hasBinExps ? `${handlerVarName}.addProjection("${Names.brackets}");` : ``}
                ${editorDef
                    .getAllNonDefaultProjectiongroups()
                    .map((group) => `${handlerVarName}.addProjection("${NamesForEditor.projection(group)}")`)
                    .join(";\n")}
                for (const p of freonConfiguration.customProjection) {
                    ${handlerVarName}.addCustomProjection(p);
                }
                handler.initConceptToPropertyProjection(map);
                ${handlerVarName}.initProviderConstructors(new Map<string, () => FreBoxProvider>(
                [
                    ${constructors.map((constr) => constr).join(",\n")}
                ]));
                ${handlerVarName}.initTableHeaders(
                [
                    ${tableHeaderInfo.map((constr) => constr).join(",\n")}
                ]);
            }
            
            /**
             * Helper function to ensure that the meta information for typeName can be found.
             * @param typeName
             */
            export function conceptRequired(typeName: string): FreLanguageConcept {
                const c = ${Names.FreLanguage}.getInstance().concept(typeName);
                if (!c) {
                    throw new Error(\`Concept '\${typeName}' not found in language.\`);
                }
                return c;
            }


            /**
             * Adds trigger and reference shortcut info to the in-memory representation of structure of the language metamodel.
             */
             export function initializeEditorDef() {
                 ${conceptsWithTrigger
                     .map(
                         (element) =>
                             `conceptRequired("${Names.concept(element.concept)}").trigger = "${element.trigger}";`,
                     )
                     .join("\n")}
                 ${conceptsWithRefShortcut
                     .map(
                         (element) =>
                             `conceptRequired("${Names.concept(element.concept)}").referenceShortcut =
                    {
                        propertyName: "${element.property.name}",
                        conceptName: "${element.property.type.name}"
                    }
                ;`,
                     )
                     .join("\n")}

            const conceptProjectionToPropertyProjection = new Map();
            }`;
    }

    private generateHeaderInfo(projection: FreEditTableProjection, imports: Imports): string {
        if (!!projection && !!projection.headers && projection.headers.length > 0 && !!projection.classifier) {
            imports.core.add("BoxUtil").add("FreTableHeaderInfo");
            return `new FreTableHeaderInfo("${projection.classifier.name}", "${projection.name}", [${projection.headers
                .map((head) => `"${head}"`)
                .join(",\n")}])`;
        }
        return "";
    }
}

/** private class to store some info */
class ConceptTriggerElement {
    concept: FreMetaConcept;
    trigger: string = "";

    constructor(concept: FreMetaConcept, trigger: string) {
        this.concept = concept;
        this.trigger = trigger;
    }
}

/** private class to store some info */
class ConceptShortCutElement {
    concept: FreMetaConcept;
    property: FreMetaProperty;

    constructor(concept: FreMetaConcept, property: FreMetaProperty) {
        this.concept = concept;
        this.property = property;
    }
}

/**
 * Generate the (nested) map from Classi fier + Projection + property to required projection for that property.
 * @param conceptProjectionToPropertyProjection
 */
function conceptProjectionToPropertyProjectionText(
    conceptProjectionToPropertyProjection: Map<string, Map<string, Map<string, string>>>,
): string {
    if (conceptProjectionToPropertyProjection.size === 0) {
        return "new Map<string, Map<string, Map<string, string>>>();";
    }
    let result: string = "new Map([                                        // the main map \n";
    for (const conceptName of conceptProjectionToPropertyProjection.keys()) {
        result += "    [                           // Concept has special projection for (one of) its parts\n";
        result +=
            '        "' +
            conceptName +
            '", new Map( [                          // Projection has special projection for (one of) the parts\n';
        const conceptMap = conceptProjectionToPropertyProjection.get(conceptName);
        if (!!conceptMap) {
            for (const projection of conceptMap.keys()) {
                result +=
                    "            [" +
                    "                                       // Projection has special projection for some part \n";
                result += '                "' + projection + '", new Map ([\n';
                const projectionMap = conceptMap.get(projection);
                if (!!projectionMap) {
                    for (const propertyProjection of projectionMap) {
                        result +=
                            '            [ "' +
                            propertyProjection[0] +
                            '", "' +
                            propertyProjection[1] +
                            '" ],             // special projection\n';
                    }
                }
                result += "         ])],";
            }
        }
        result += "     ])],";
    }
    result += "])";
    return result;
}
