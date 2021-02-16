import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { ValidationUtils } from "../ValidationUtils";

export class ReferenceCheckerTemplate {
    imports: string[] = [];

    generateChecker(language: PiLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.PiError;
        const errorSeverityName: string = Names.PiErrorSeverity;
        const checkerClassName: string = Names.referenceChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const writerInterfaceName: string = Names.PiWriter;
        const environmentName: string = Names.environment(language);
        const overallTypeName: string = Names.allConcepts(language);

        // because 'createChecksOnNonOptionalParts' determines which concepts to import
        // and thus fills 'this.imports' list, it needs to be called before the rest of the template
        // is returned
        this.imports = [];
        const allMethods = `${language.concepts.map(concept =>
            `${this.createChecksOnNonOptionalParts(concept, environmentName)}`
        ).join("\n\n")}`;

        // the template starts here
        return `
        import { ${errorClassName}, ${errorSeverityName}, ${writerInterfaceName}, ${Names.PiNamedElement} } from "${PROJECTITCORE}";
        import { ${overallTypeName}, ${Names.PiElementReference}, ${this.imports.map(imp => `${imp}` ).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${environmentName} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${environmentName}";
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";   
        import { ${checkerInterfaceName} } from "./${Names.validator(language)}";

        /**
         * Class ${checkerClassName} is part of the implementation of the default validator. 
         * It checks whether references can be found within the model.
         *
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = (${environmentName}.getInstance() as ${environmentName}).writer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

            ${allMethods}           
            
            private makeErrorMessage(modelelement: ${overallTypeName}, referredElem: ${Names.PiElementReference}<${Names.PiNamedElement}>, propertyName: string, locationDescription: string) {
                // TODO adjust this to pathnames in PiElementReference
                const scoper = ${environmentName}.getInstance().scoper;
                const possibles = scoper.getVisibleElements(modelelement).filter(elem => elem.name === referredElem.name);
                if (possibles.length > 0) {
                    this.errorList.push(
                        new PiError(                                       
                            \`Reference '\${referredElem.pathnameToString("/")}' should have type '\${referredElem.typeName}', but found type(s) [\${possibles.map(elem => \`\${elem.piLanguageConcept()}\`).join(", ")}]\`,
                                modelelement,
                                \`\${propertyName} of \${locationDescription}\`,
                            PiErrorSeverity.Error
                        )
                    );
                } else {
                    this.errorList.push(
                        new PiError(\`Cannot find reference '\${referredElem.pathnameToString("/")}'\`, modelelement, \`\${propertyName} of \${locationDescription}\`, PiErrorSeverity.Error)
                    );
                }
            }
        }`;
    }

    private createChecksOnNonOptionalParts(concept: PiConcept, environmentName: string): string {
        let result: string = "";
        const locationdescription = ValidationUtils.findLocationDescription(concept);
        concept.allProperties().forEach(prop => {
            if (!prop.isPart) {
                if (prop.isList) {
                    result += `for (const referredElem of modelelement.${prop.name} ) {
                        if (referredElem.referred === null) {
                            this.makeErrorMessage(modelelement, referredElem, "${prop.name}", \`\${${locationdescription}}\`);
                            hasFatalError = true;
                        }
                    }`;
                } else {
                    result += `if (!!modelelement.${prop.name} && modelelement.${prop.name}.referred === null) {
                            this.makeErrorMessage(modelelement, modelelement.${prop.name}, "${prop.name}", \`\${${locationdescription}}\`);
                            hasFatalError = true;
                    }`;
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
