import { Names } from "../../Names";
import { PiLanguage } from "../../../metalanguage/PiLanguage";

export class ActionsTemplate {
    constructor() {
    }

    generateDefaultActions(language: PiLanguage): string {
        return `
            import * as Keys from "@projectit/core";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                Box,
                EXPRESSION_PLACEHOLDER,
                KeyboardShortcutBehavior,
                LEFT_MOST,
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
                RIGHT_MOST
            } from "@projectit/core";
            
            ${language.concepts.map(c => `import { ${Names.concept(c)} } from "../../language/${Names.concept(c)}";`).join("")}

            export const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.concepts.filter(c => c.expression() && !c.binaryExpression() && !c.isAbstract && !!c.trigger).map(c =>
            `{
                    trigger: ${c.triggerIsRegExp ? `/${c.getTrigger()}/` : `"${c.getTrigger()}"`},
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
                ${language.concepts.filter(c => c.binaryExpression() && !c.isAbstract).map(c =>
            `{
                    trigger: "${c.getSymbol()}",
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
                ${language.concepts.flatMap(c => c.parts).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.concept();
                return `
                {
                    activeInBoxRoles: ["new-${part.name}"],
                    trigger: "${!!part.type.concept().trigger ? part.type.concept().getTrigger() : part.name}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        var parent: ${Names.concept(parentConcept)} = box.element as ${Names.concept(parentConcept)};
                        const new${part.name}: ${Names.concept(partConcept)} = new ${Names.concept(partConcept)}();
                        parent.${part.name}.push(new${part.name});
                        return new${part.name};
                    },
                    boxRoleToSelect: "${part.name}-name"
                }
                `}).join(",")}
            ];
            
            export const KEYBOARD: KeyboardShortcutBehavior[] = [
                ${language.concepts.flatMap(c => c.parts).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.concept();
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

    generateManualActions(language: PiLanguage): string {
        return `
            import {
                KeyboardShortcutBehavior,
                PiBinaryExpressionCreator,
                PiCustomBehavior,
                PiExpressionCreator
            } from "@projectit/core";
            
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

    generateActions(language: PiLanguage): string {
        return `
            import {
                KeyboardShortcutBehavior,
                PiActions,
                PiActionsUtil,
                PiBinaryExpressionCreator,
                PiCustomBehavior,
                PiExpressionCreator
            } from "@projectit/core";
            
            import { EXPRESSION_CREATORS, BINARY_EXPRESSION_CREATORS, CUSTOM_BEHAVIORS, KEYBOARD } from "./${Names.defaultActions(language)}";
            import { MANUAL_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_CREATORS, MANUAL_CUSTOM_BEHAVIORS, MANUAL_KEYBOARD } from "../${Names.manualActions(language)}";

            export class ${Names.actions(language)} implements PiActions {
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
