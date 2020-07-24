import { flatten } from "lodash";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiBinaryExpressionConcept, PiExpressionConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiEditUnit } from "../../metalanguage";
import { PiLangUtil } from "../../../languagedef/metalanguage/PiLangUtil";

export class ActionsTemplate {
    constructor() {
    }

    // TODO generate the correct class comment for Actions
    generate(language: PiLanguageUnit, editorDef: PiEditUnit): string {
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
            import { MANUAL_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_CREATORS, MANUAL_CUSTOM_BEHAVIORS, MANUAL_KEYBOARD } from "../${Names.customActions(language)}";

             /**
             * Class ${Names.actions(language)} implements ... TODO.
             * These custom build additions are merged with the default and definition-based editor parts 
             * in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */  
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
