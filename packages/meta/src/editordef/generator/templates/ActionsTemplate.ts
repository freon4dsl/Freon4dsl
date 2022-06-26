import { Names, PROJECTITCORE } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage/PiLanguage";

export class ActionsTemplate {

    generate(language: PiLanguage): string {
        return `
            import {
                PiActions,
                PiActionsUtil,
                PiCreateBinaryExpressionAction,
                PiCustomAction
            } from "${PROJECTITCORE}";
            
            import { BINARY_EXPRESSION_CREATORS, CUSTOM_ACTIONS } from "./${Names.defaultActions(language)}";
            import { MANUAL_BINARY_EXPRESSION_ACTIONS, MANUAL_CUSTOM_ACTIONS } from "../${Names.customActions(language)}";

             /**
             * Class ${Names.actions(language)} implements the actions available to the user in the editor.
             * These are the actions based on the editor definition. They are merged with the default and 
             * custom editor parts in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */  
            export class ${Names.actions(language)} implements ${Names.PiActions} {
                // Combine generated and manually written actions, where manual actions may override the generated ones
                binaryExpressionActions: PiCreateBinaryExpressionAction[] = PiActionsUtil.join(BINARY_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_ACTIONS) as PiCreateBinaryExpressionAction[];
                customActions: PiCustomAction[] = PiActionsUtil.join(CUSTOM_ACTIONS, MANUAL_CUSTOM_ACTIONS) as PiCustomAction[];
            }`;
    }
}
