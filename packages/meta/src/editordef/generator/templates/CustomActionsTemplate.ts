import { Names, Imports } from "../../../utils/on-lang/index.js"
import type { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";

export class CustomActionsTemplate {
    generate(language: FreMetaLanguage): string {
        const imports = new Imports()
        imports.core.add(Names.FreCustomAction).add(Names.FreCreateBinaryExpressionAction).add(Names.FreActions)

        return `
            // TEMPLATE: CustomActionsTemplate.generate(...)
            ${imports.makeImports(language)}

             /**
             * Class ${Names.customActions(language)} provides an entry point for the language engineer to
             * define custom build additions to the editor.
             * These custom build additions are merged with the default and definition-based editor parts
             * in a three-way manner. For each node,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.customActions(language)} implements ${Names.FreActions} {
                binaryExpressionActions: ${Names.FreCreateBinaryExpressionAction}[] = MANUAL_BINARY_EXPRESSION_ACTIONS;
                customActions: ${Names.FreCustomAction}[] = MANUAL_CUSTOM_ACTIONS;
            }

            export const MANUAL_BINARY_EXPRESSION_ACTIONS: ${Names.FreCreateBinaryExpressionAction}[] = [
                // Add your own custom binary expression actions here
            ];

            export const MANUAL_CUSTOM_ACTIONS: ${Names.FreCustomAction}[] = [
                // Add your own custom behavior here
            ];
        `;
    }
}
