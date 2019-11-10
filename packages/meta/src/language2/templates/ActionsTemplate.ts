import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class ActionsTemplate {
    constructor() {
    }

    generateActions(language: PiLanguage): string {
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
            
            ${language.concepts.map(c => `import { ${Names.concept(c)} } from "../language/${Names.concept(c)}";`).join("")}

            const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.concepts.filter(c => c.expression() && !c.binaryExpression() && !c.isAbstract && !!c.symbol).map(c =>
            `{
                    trigger: "${c.getSymbol()}",
                    activeInBoxRoles: [
                        EXPRESSION_PLACEHOLDER
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        return new ${Names.concept(c)}();
                    }
            }`
        )}
            ];

            const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
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
            
            const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
                ${language.concepts.flatMap(c => c.parts).filter(p => p.isList).map(part => {
                    const parentConcept = part.concept;
                    const partConcept = part.type.concept();
                return `
                {
                    activeInBoxRoles: ["new-${part.name}"],
                    trigger: "${part.name}",
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
            
            const KEYBOARD: KeyboardShortcutBehavior[] = [];

            export class ${Names.actions(language)} implements PiActions {
                expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
                binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
                customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
                keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;
                constructor() {
                }
            }`;
    }

}
