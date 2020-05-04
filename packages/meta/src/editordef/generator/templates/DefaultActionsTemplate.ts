import { flatten } from "lodash";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiBinaryExpressionConcept, PiExpressionConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";
import { LangUtil } from "./LangUtil";

export class DefaultActionsTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, editorDef: DefEditorLanguage, relativePath: string): string {
        return `
            import * as Keys from "${PROJECTITCORE}";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                EXPRESSION_PLACEHOLDER,
                Box,
                KeyboardShortcutBehavior,
                MetaKey,
                PiActions,
                PiBinaryExpressionCreator,
                PiCaret,
                PiCustomBehavior,
                PiEditor,
                PiElement,
                PiExpressionCreator,
                PiKey,
                PiLogger,
                PiTriggerType,
                PiUtils,
                LEFT_MOST,
                RIGHT_MOST
            } from "${PROJECTITCORE}";
            
            import { PiElementReference, ${language.concepts.map(c => `${Names.concept(c)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

            export const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.concepts.filter(c => c instanceof PiExpressionConcept && !(c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `{
                    trigger: ${c.triggerIsRegExp ? `/${editorDef.findConceptEditor(c).trigger}/` : `"${editorDef.findConceptEditor(c).trigger}"`},
                    activeInBoxRoles: [
                        EXPRESSION_PLACEHOLDER
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        return new ${Names.concept(c)}();
                    }
            }`
        )}
            ];

            export const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
                ${language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `{
                    trigger: "${editorDef.findConceptEditor(c).symbol}",
                    activeInBoxRoles: [
                        LEFT_MOST,
                        RIGHT_MOST,
                        EXPRESSION_PLACEHOLDER,
                        BEFORE_BINARY_OPERATOR,
                        AFTER_BINARY_OPERATOR
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        return new ${Names.concept(c)}();
                    },
                    boxRoleToSelect: EXPRESSION_PLACEHOLDER
                }`
        )}
            ];
            
            export const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
                ${flatten(language.concepts.map(c => c.parts())).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referred;
                    return `${LangUtil.subClasses(partConcept).filter(cls => !cls.isAbstract).map(subClass => 
                        `{
                            activeInBoxRoles: ["new-${part.name}"],
                            trigger: "${!!editorDef.findConceptEditor(subClass)?.trigger ? editorDef.findConceptEditor(subClass)?.trigger : subClass.name}",
                            action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                const parent: ${Names.classifier(parentConcept)} = box.element as ${Names.classifier(parentConcept)};
                                const new${part.name}: ${Names.concept(subClass)} = new ${Names.concept(subClass)}();
                                ${part.isList ? `parent.${part.name}.push(new${part.name});` : `parent.${part.name}= new${part.name};`}
                                return new${part.name};
                            },
                            boxRoleToSelect: "${part.name}-name"
                        }`).join(",\n")}
                `}).join(",")}
                ,
                ${flatten(language.concepts.map(c => c.references())).filter(p => p.isList).map(reference => {
                    const parentConcept = reference.owningConcept;
                    const partConcept = reference.type.referred;
                    return `
                        {
                            activeInBoxRoles: ["new-${reference.name}"],
                            trigger: "${!!editorDef.findConceptEditor(reference.type.referred).trigger ? `${editorDef.findConceptEditor(reference.type.referred).trigger}` : reference.name}",
                            action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                const parent: ${Names.classifier(parentConcept)} = box.element as ${Names.classifier(parentConcept)};
                                const newBase: PiElementReference< ${Names.concept(reference.type.referred)}> = PiElementReference.createNamed("", null);
                                parent.${reference.name}.push(newBase);
                                return null;
                            },
                            boxRoleToSelect: "${reference.name}-name"
                        }
                `}).join(",")}
            ];
            
            export const KEYBOARD: KeyboardShortcutBehavior[] = [
                ${flatten(language.concepts.map(c => c.parts())).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referred;
                    // TODO add keyboartd shortcut
                    return `
                    // {
                    //     activeInBoxRoles: ["new-${part.name}"],
                    //     trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
                    //     action: (box: Box, trigger: PiTriggerType, ed: PiEditor): Promise< PiElement> => {
                    //         var parent: ${Names.classifier(parentConcept)} = box.element as ${Names.classifier(parentConcept)};
                    //         const new${part.name}: ${Names.concept(partConcept)} = new ${Names.concept(partConcept)}();
                    //         parent.${part.name}.push(new${part.name});
                    //         return Promise.resolve(new${part.name});
                    //     },
                    //     boxRoleToSelect: "${part.name}-name"
                    // }`;
                 }).join(",")}
            ];
            `;
        }
}

