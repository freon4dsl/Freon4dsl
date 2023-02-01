import { Names, PROJECTITCORE } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";

export class CustomActionsTemplate {

    generate(language: PiLanguage): string {
        return `
            import {
                PiCreateBinaryExpressionAction,
                PiCustomAction,
                ${Names.PiActions}
            } from "${PROJECTITCORE}";
 
             /**
             * Class ${Names.customActions(language)} provides an entry point for the language engineer to
             * define custom build additions to the editor.
             * These custom build additions are merged with the default and definition-based editor parts 
             * in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */           
            export class ${Names.customActions(language)} implements ${Names.PiActions} {
                binaryExpressionActions: PiCreateBinaryExpressionAction[] = MANUAL_BINARY_EXPRESSION_ACTIONS;
                customActions: PiCustomAction[] = MANUAL_CUSTOM_ACTIONS;
            }

            export const MANUAL_BINARY_EXPRESSION_ACTIONS: PiCreateBinaryExpressionAction[] = [
                // Add your own custom binary expression actions here
            ];
            
            export const MANUAL_CUSTOM_ACTIONS: PiCustomAction[] = [
                // Add your own custom behavior here
            ];     
        `;
    }
}
