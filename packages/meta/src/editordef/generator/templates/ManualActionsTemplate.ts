import { PROJECTITCORE } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class ManualActionsTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, editorDef: DefEditorLanguage): string {
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
}
