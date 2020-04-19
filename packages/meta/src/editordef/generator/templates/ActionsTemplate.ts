import { flatten } from "lodash";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiLangBinaryExpressionConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class ActionsTemplate {
    constructor() {
    }

    // TODO remove typecast on line 54
    generateDefaultActions(language: PiLanguageUnit, editorDef: DefEditorLanguage, relativePath: string): string {
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
            
            import { PiElementReference, ${language.classes.map(c => `${Names.concept(c)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

            export const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.classes.filter(c => c.expression() && !c.binaryExpression() && !c.isAbstract).map(c =>
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
                ${language.classes.filter(c => c.binaryExpression() && !c.isAbstract).map(c =>
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
                ${flatten(language.classes.map(c => c.parts)).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referedElement();
                    return `
                        {
                            activeInBoxRoles: ["new-${part.name}"],
                            trigger: "${!!part.type.referedElement().trigger ? part.type.referedElement().getTrigger() : part.name}",
                            action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                var parent: ${Names.concept(parentConcept)} = box.element as ${Names.concept(parentConcept)};
                                const new${part.name}: ${Names.concept(partConcept)} = new ${Names.concept(partConcept)}();
                                parent.${part.name}.push(new${part.name});
                                return new${part.name};
                            },
                            boxRoleToSelect: "${part.name}-name"
                        }
                `}).join(",")}
                ,
                ${flatten(language.classes.map(c => c.references)).filter(p => p.isList).map(reference => {
                    const parentConcept = reference.owningConcept;
                    const partConcept = reference.type.referedElement();
                    return `
                        {
                            activeInBoxRoles: ["new-${reference.name}"],
                            trigger: "${!!reference.type.referedElement().trigger ? reference.type.referedElement().getTrigger() : reference.name}",
                            action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                var parent: ${Names.concept(parentConcept)} = box.element as ${Names.concept(parentConcept)};
                                const newBase: PiElementReference< ${Names.concept(reference.type.referedElement())}> = PiElementReference.createNamed("", null);
                                parent.${reference.name}.push(newBase);
                                return null;
                            },
                            boxRoleToSelect: "${reference.name}-name"
                        }
                `}).join(",")}
            ];
            
            export const KEYBOARD: KeyboardShortcutBehavior[] = [
                ${flatten(language.classes.map(c => c.parts)).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referedElement();
                    return `
                    {
                        activeInBoxRoles: ["new-${part.name}"],
                        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): Promise< PiElement> => {
                            var parent: ${Names.concept(parentConcept)} = box.element as ${Names.concept(parentConcept)};
                            const new${part.name}: ${Names.concept(partConcept)} = new ${Names.concept(partConcept)}();
                            parent.${part.name}.push(new${part.name});
                            return Promise.resolve(new${part.name});
                        },
                        boxRoleToSelect: "${part.name}-name"
                    }`;
                 }).join(",")}
            ];
            `;
        }

    generateManualActions(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
        return `
            import {
                KeyboardShortcutBehavior,
                PiBinaryExpressionCreator,
                PiCustomBehavior,
                PiExpressionCreator
            } from "${PROJECTITCORE}";
            
            export const MANUAL_EXPRESSION_CREATORS: PiExpressionCreator[] = [
                // Add your own custom expression creators here
            ];

            export const MANUAL_BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
                // Add your own custom binary expression creators here
            ];
            
            export const MANUAL_CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
                // Add your own custom behavior here
            ];
            
            export const MANUAL_KEYBOARD: KeyboardShortcutBehavior[] = [
                // Add your own custom keyboard shortcuts here
            ];
        `;
    }

    generateActions(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
        return `
            import {
                KeyboardShortcutBehavior,
                PiActions,
                PiActionsUtil,
                PiBinaryExpressionCreator,
                PiCustomBehavior,
                PiExpressionCreator
            } from "${PROJECTITCORE}";
            
            import { EXPRESSION_CREATORS, BINARY_EXPRESSION_CREATORS, CUSTOM_BEHAVIORS, KEYBOARD } from "./${Names.defaultActions(language)}";
            import { MANUAL_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_CREATORS, MANUAL_CUSTOM_BEHAVIORS, MANUAL_KEYBOARD } from "../${Names.manualActions(language)}";

            export class ${Names.actions(language)} implements ${Names.PiActions} {
                // Combine generated and manually written actions, where manual actions may override the generated ones
                expressionCreators: PiExpressionCreator[] = PiActionsUtil.join(EXPRESSION_CREATORS, MANUAL_EXPRESSION_CREATORS) as PiExpressionCreator[];
                binaryExpressionCreators: PiBinaryExpressionCreator[] = PiActionsUtil.join(BINARY_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_CREATORS) as PiBinaryExpressionCreator[];
                customBehaviors: PiCustomBehavior[] = PiActionsUtil.join(CUSTOM_BEHAVIORS, MANUAL_CUSTOM_BEHAVIORS) as PiCustomBehavior[];
                keyboardActions: KeyboardShortcutBehavior[] = PiActionsUtil.join(KEYBOARD, MANUAL_KEYBOARD) as KeyboardShortcutBehavior[];
                
                constructor() {
                }
            }`;
    }
}
