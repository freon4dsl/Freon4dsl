import { Names, Imports } from '../../../utils/on-lang/index.js';
import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";

export class ActionsTemplate {
    generate(language: FreMetaLanguage, customsFolder: string, relativePath: string): string {
        const imports = new Imports() 
        imports.core.add(Names.FreActions).add(Names.ActionsUtil).add(Names.FreCreateBinaryExpressionAction).add(Names.FreCustomAction)
        return `
            // TEMPLATE: ActionsTemplate.generate(...)
            ${imports.makeImports(language)}
            import { BINARY_EXPRESSION_CREATORS, CUSTOM_ACTIONS } from "./${Names.defaultActions(language)}.js";
            import { MANUAL_BINARY_EXPRESSION_ACTIONS, MANUAL_CUSTOM_ACTIONS } from "${relativePath}${customsFolder}${Names.customActions(language)}.js";

             /**
             * Class ${Names.actions(language)} implements the actions available to the user in the editor.
             * These are the actions based on the editor definition. They are merged with the default and
             * custom editor parts in a three-way manner. For each node,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.actions(language)} implements ${Names.FreActions} {
                // Combine generated and manually written actions, where manual actions may override the generated ones
                binaryExpressionActions: ${Names.FreCreateBinaryExpressionAction}[] = ${Names.ActionsUtil}.join(BINARY_EXPRESSION_CREATORS, MANUAL_BINARY_EXPRESSION_ACTIONS) as ${Names.FreCreateBinaryExpressionAction}[];
                customActions: ${Names.FreCustomAction}[] = ${Names.ActionsUtil}.join(CUSTOM_ACTIONS, MANUAL_CUSTOM_ACTIONS) as ${Names.FreCustomAction}[];
            }`;
    }
}
