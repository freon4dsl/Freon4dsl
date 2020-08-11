import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER, langExpToTypeScript } from "../../../utils";
import { PiLanguage, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { ValidationUtils } from "../ValidationUtils";

export class ReferenceCheckerTemplate {
    imports: string[] = [];

    generateChecker(language: PiLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.referenceChecker(language);
        const unparserInterfaceName: string = Names.PiUnparser;

        // because 'createChecksOnNonOptionalParts' determines which concepts to import
        // and thus fills 'this.imports' list, it needs to be called before the rest of the template
        // is returned
        this.imports = [];
        let allMethods = `${language.concepts.map(concept =>
            `${this.createChecksOnNonOptionalParts(concept)}`
        ).join("\n\n")}`;

        // the template starts here
        return `
        import { ${errorClassName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.imports.map(imp => `${imp}` ).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
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

            ${allMethods}
        }`;
    }

    private createChecksOnNonOptionalParts(concept: PiConcept) : string {
        let result: string = '';
        let locationdescription = ValidationUtils.findLocationDescription(concept);

        concept.allProperties().forEach(prop => {
            if (!prop.isPart) {
                if (prop.isList) {
                    result += `for (let referredElem of modelelement.${prop.name} ) {
                        if (referredElem.referred == null) {
                            this.errorList.push(
                                new PiError(\`Cannot find reference '\${referredElem.name}'\`, modelelement, \`${prop.name} of \${${locationdescription}}\`)
                            );
                            hasFatalError = true;
                        }
                    }`
                } else {
                    result += `if (!!modelelement.${prop.name} && modelelement.${prop.name}.referred == null) {
                        this.errorList.push(new PiError(\`Cannot find reference '\${modelelement.${prop.name}.name}'\`, modelelement, \`${prop.name} of \${${locationdescription}}\`));
                        hasFatalError = true;
                    }`
                }
            }
        });

        if (result.length > 0) {
            this.imports.push(Names.concept(concept));
            return `
            /**
             * Checks 'modelelement' before checking its children.
             * Found errors are pushed onto 'errorlist'.
             * If an error is found, it is considered 'fatal', which means that no other checks on 
             * 'modelelement' are performed.
             *
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
