import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class ActionsTemplate {
    constructor() {
    }

    generateActions(language: PiLanguage): string {
        const result = `
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
            
            ${language.concepts.map(c => `import { ${c.name} } from "../language/${Names.concept(c)}";`).join("")}

            const EXPRESSION_CREATORS: PiExpressionCreator[] = [
                ${language.concepts.filter(c => c.expression() && !c.binaryExpression() && !c.isAbstract && !!c.symbol).map(c =>
            `{
                    trigger: "${c.getSymbol()}",
                    activeInBoxRoles: [
                        EXPRESSION_PLACEHOLDER
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        return new ${c.name}();
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
                        return new ${c.name}();
                    },
                    boxRoleToSelect: EXPRESSION_PLACEHOLDER
                }`
        )}
            ];
            
            const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [];
            
            const KEYBOARD: KeyboardShortcutBehavior[] = [];

            export class ${language.name}Actions implements PiActions {
                expressionCreators: PiExpressionCreator[] = EXPRESSION_CREATORS;
                binaryExpressionCreators: PiBinaryExpressionCreator[] = BINARY_EXPRESSION_CREATORS;
                customBehaviors: PiCustomBehavior[] = CUSTOM_BEHAVIORS;
                keyboardActions: KeyboardShortcutBehavior[] = KEYBOARD;
                constructor() {
                }
            }`;
        return result;
    }

}
