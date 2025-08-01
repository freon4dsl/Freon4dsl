import { Names, Imports } from "../../../utils/on-lang/index.js"
import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";

export class CustomProjectionTemplate {
    generate(language: FreMetaLanguage): string {
        const imports = new Imports()
        imports.core.add(Names.FreNode).add(Names.Box).add(Names.FreProjection).add(Names.FreTableDefinition).add(Names.FreProjectionHandler)
        return `
            // TEMPLATE: CustomProjectionTemplate.generate(...)
            ${imports.makeImports(language)}

             /**
             * Class ${Names.customProjection(language)} provides an entry point for the language engineer to
             * define custom build additions to the editor.
             * These are merged with the custom build additions and other definition-based editor parts
             * in a three-way manner. For each node,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on one of the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.customProjection(language)} implements ${Names.FreProjection} {
                name: string = "Custom";
                handler: FreProjectionHandler;
                nodeTypeToBoxMethod: Map<string, (node: ${Names.FreNode}) => ${Names.Box}> =
                    new Map<string, (node: ${Names.FreNode}) => ${Names.Box}>([
                        // register your custom box methods here
                        // ['NAME_OF_CONCEPT', this.BOX_FOR_CONCEPT],
                    ]);
                nodeTypeToTableDefinition: Map<string, () => ${Names.FreTableDefinition}> =
                    new Map<string, () => ${Names.FreTableDefinition}>([
                        // register your custom table definition methods here
                        // ['NAME_OF_CONCEPT', this.TABLE_DEFINITION_FOR_CONCEPT],
                    ]);

                // add your custom methods here

                // BOX_FOR_CONCEPT(node: NAME_OF_CONCEPT) : ${Names.Box} { ... }

                // TABLE_DEFINITION_FOR_CONCEPT() : ${Names.FreTableDefinition} { ... }
            }
        `;
    }
}
