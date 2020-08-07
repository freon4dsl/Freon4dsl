import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER, langExpToTypeScript } from "../../../utils";
import { PiLanguage, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { ValidationUtils } from "../ValidationUtils";

export class ReferenceCheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.referenceChecker(language);
        const unparserInterfaceName: string = Names.PiUnparser;


        // the template starts here
        return `
        import { ${errorClassName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        import { ${defaultWorkerName} } from "${relativePath}${PathProvider.defaultWorker(language)}";   

        /**
         * Class ${checkerClassName} is part of the implementation of the default validator. 
         * It checks whether references can be found within the model.
         *
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} {
            // 'myUnparser' is used to provide error messages on the nodes in the model tree
            myUnparser: ${unparserInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).unparser;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

            ${language.concepts.map(concept =>
                `${this.createChecksOnNonOptionalParts(concept)}`
            ).join("\n\n")}
        }`;
    }

    private createImports(language: PiLanguage) : string {
        let result : string = "";
        result = language.concepts?.map(concept => `
                ${Names.concept(concept)}`).join(", ");
        result = result.concat(language.concepts? `,` :``);
        result = result.concat(
            language.interfaces?.map(intf => `
                ${Names.interface(intf)}`).join(", "));
        return result;
    }

    private createChecksOnNonOptionalParts(concept: PiConcept) : string {
        let result: string = '';
        let locationdescription = ValidationUtils.findLocationDescription(concept);

        concept.allProperties().forEach(prop => {
            // empty lists can be checked using one of the validation rules
            if (!prop.isPart && !prop.isList) {
                result += `if (!!modelelement.${prop.name} && modelelement.${prop.name}.referred == null) {
                    this.errorList.push(new PiError(\`Cannot find reference '\${modelelement.${prop.name}.name}'\`, modelelement, \`${prop.name} of \${${locationdescription}}\`));
                    hasFatalError = true;
                }
                `
            }
        });

        if (result.length > 0) {
            return `
            /**
             * Checks 'modelelement' before checking its children.
             * Found errors are pushed onto 'errorlist'.
             * If an error is found, it is considered 'fatal', which means that no other checks on 
             * 'modelelement' are performed.
             
             * @param modelelement
             */
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                let hasFatalError: boolean = false;
                ${result}
                return hasFatalError;
            }`;
        } else {
            return ``;
        }
    }
}
