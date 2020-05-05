import { flatten } from "lodash";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiBinaryExpressionConcept, PiExpressionConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";
import { LangUtil } from "./LangUtil";

export class ActionsTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
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
