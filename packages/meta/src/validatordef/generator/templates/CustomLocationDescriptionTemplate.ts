import { Imports, Names } from "../../../utils/on-lang/index.js"
import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js"

export class CustomLocationDescriptionTemplate {

    generateLocationDescription(language: FreMetaLanguage, relativePath: string): string {
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            "errorLocation",
            Names.FreNode
        ])
        return `${imports.makeImports(language)}

        /**
         * The function locationDescription turns the information on the location of a node 
         * within the model into a human-readable string. It is used for error messages.
         * 
         * @param node the node of which the location is described
         */
        export function locationDescription(node: ${Names.FreNode}): string {
            let result: string = '';
            const loc: string[] = errorLocation(node);
            loc.reverse();
            for (let index = 0; index < loc.length; index++) {
                result += loc[index]
                if (index !== loc.length - 1) {
                    result += ' of ';
                }
            }
            return result;
        }`
    }
}
