import { Names, FREON_CORE, LANGUAGE_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER } from "../../../utils/index.js";
import { FreMetaLanguage, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { ValidationUtils } from "../ValidationUtils.js";

const paramName: string = "node";

export class ReferenceCheckerTemplate {
    imports: string[] = [];

    generateChecker(language: FreMetaLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const errorSeverityName: string = Names.FreErrorSeverity;
        const checkerClassName: string = Names.referenceChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const writerInterfaceName: string = Names.FreWriter;
        const overallTypeName: string = Names.allConcepts();

        // because 'createChecksOnNonOptionalParts' determines which concepts to import
        // and thus fills 'this.imports' list, it needs to be called before the rest of the template
        // is returned
        this.imports = [];
        const allClassifiers: FreMetaClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        const allMethods: string = `${allClassifiers.map((concept) => `${this.createChecksOnNonOptionalParts(concept)}`).join("\n\n")}`;

        // the template starts here
        return `
        import { ${errorClassName}, ${errorSeverityName}, ${writerInterfaceName}, ${Names.FreNodeReference}, ${Names.FreNamedNode}, ${Names.FreNode}, ${Names.LanguageEnvironment} } from "${FREON_CORE}";
        import { ${this.imports.map((imp) => `${imp}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}/index.js";
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}/index.js";
        import { ${checkerInterfaceName} } from "./${Names.validator(language)}.js";

        /**
         * Class ${checkerClassName} is part of the implementation of the default validator.
         * It checks whether references can be found within the model.
         *
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = ${Names.LanguageEnvironment}.getInstance().writer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];
            private refSeparator: string = '${Names.referenceSeparator}';

            ${allMethods}

            private makeErrorMessage(${paramName}: ${overallTypeName}, referredElem: ${Names.FreNodeReference}<${Names.FreNamedNode}>, propertyName: string, locationDescription: string) {
                const scoper = ${Names.LanguageEnvironment}.getInstance().scoper;
                const possibles = scoper.getVisibleElements(${paramName}).filter(elem => elem.name === referredElem.name);
                if (possibles.length > 0) {
                    this.errorList.push(
                        new ${Names.FreError}(
                            \`Reference '\${referredElem.pathnameToString(this.refSeparator)}' should have type '\${referredElem.typeName}', but found type(s) [\${possibles.map(elem => \`\${elem.freLanguageConcept()}\`).join(", ")}]\`,
                                ${paramName},
                                \`\${propertyName} of \${locationDescription}\`,
                            \`\${propertyName}\`,
                            ${Names.FreErrorSeverity}.Error
                        )
                    );
                } else {
                    this.errorList.push(
                        new ${Names.FreError}(\`Cannot find reference '\${referredElem.pathnameToString(this.refSeparator)}'\`, ${paramName}, \`\${propertyName} of \${locationDescription}\`, \`\${propertyName}\`, ${Names.FreErrorSeverity}.Error)
                    );
                }
            }
        }`;
    }

    private createChecksOnNonOptionalParts(concept: FreMetaClassifier): string {
        let result: string = "";
        // todo check location description, I (A) think that too often 'unnamed' is the result
        const locationdescription = ValidationUtils.findLocationDescription(concept, paramName);
        concept.allProperties().forEach((prop) => {
            if (!prop.isPart) {
                if (prop.isList) {
                    result += `for (const referredElem of ${paramName}.${prop.name} ) {
                        if (referredElem.referred === null) {
                            this.makeErrorMessage(${paramName}, referredElem, "${prop.name}", \`\${${locationdescription}}\`);
                        }
                    }`;
                } else {
                    result += `if (!!${paramName}.${prop.name} && ${paramName}.${prop.name}.referred === null) {
                            this.makeErrorMessage(${paramName}, ${paramName}.${prop.name}, "${prop.name}", \`\${${locationdescription}}\`);
                    }`;
                }
            }
        });

        if (result.length > 0) {
            this.imports.push(Names.classifier(concept));
            return `
            /**
             * Checks '${paramName}' before checking its children.
             * Found errors are pushed onto 'errorlist'.
             * If an error is found, it is considered 'fatal', which means that no other checks on
             * '${paramName}' are performed.
             *
             * @param ${paramName}
             */
            public execBefore${Names.classifier(concept)}(${paramName}: ${Names.classifier(concept)}): boolean {
                ${result}
                return false;
            }`;
        } else {
            return ``;
        }
    }
}
