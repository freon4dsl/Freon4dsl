import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, langExpToTypeScript, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiConcept, PiLangElement, PiProperty, PiPrimitiveProperty } from "../../../languagedef/metalanguage/PiLanguage";

export class DefaultWorkerTemplate {

    generateDefaultWorker(language: PiLanguage, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const defaultWorkerClassName = Names.defaultWorker(language);
        const commentBefore =   `/**
                                 * Visits 'modelelement' before visiting its children.
                                 * @param modelelement
                                 */`;
        const commentAfter =    `/**
                                 * Visits 'modelelement' after visiting its children.
                                 * @param modelelement
                                 */`;

        // the template starts here
        return `
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}"; 
        import { ${workerInterfaceName} } from "./${Names.workerInterface(language)}";     

        /**
         * Class ${defaultWorkerClassName} is part of the implementation of the visitor pattern on models.
         * It implements the interface ${workerInterfaceName} with empty methods, and can thus be used as
         * base to any class that needs to traverse the model tree. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual visiting of each node in the tree.
         */
        export class ${defaultWorkerClassName} implements ${workerInterfaceName} {

        ${language.concepts.map(concept =>
            `${commentBefore}
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                return false;
            }
            
            ${commentAfter}
            public execAfter${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                return false;
            }`
        ).join("\n\n")}
        }`;
    }

    private createImports(language: PiLanguage): string {
        let result: string = "";
        result = language.concepts?.map(concept => `
                ${Names.concept(concept)}`).join(", ");
        result = result.concat(language.concepts ? `,` : ``);
        result = result.concat(
            language.interfaces?.map(intf => `
                ${Names.interface(intf)}`).join(", "));
        return result;
    }

}
