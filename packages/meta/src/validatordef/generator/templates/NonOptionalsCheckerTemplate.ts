import { Names, FREON_CORE, LANGUAGE_GEN_FOLDER, CONFIGURATION_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER } from "../../../utils";
import { FreLanguage, FreClassifier, FrePrimitiveType } from "../../../languagedef/metalanguage";
import { ValidationUtils } from "../ValidationUtils";

const commentBefore = `/**
                        * Checks 'modelelement' before checking its children.
                        * Found errors are pushed onto 'errorlist'.
                        * If an error is found, it is considered 'fatal', which means that no other checks on
                        * 'modelelement' are performed.
                        *
                        * @param modelelement
                        */`;

export class NonOptionalsCheckerTemplate {
    done: FreClassifier[] = [];

    generateChecker(language: FreLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const errorSeverityName: string = Names.FreErrorSeverity;
        const checkerClassName: string = Names.nonOptionalsChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const writerInterfaceName: string = Names.FreWriter;
        const classifiersToDo: FreClassifier[] = [];
        classifiersToDo.push(language.modelConcept);
        classifiersToDo.push(...language.units);
        classifiersToDo.push(...language.concepts);
        this.done = [];

        // the template starts here
        return `
        import { ${errorClassName}, ${errorSeverityName}, ${writerInterfaceName}, ${Names.LanguageEnvironment} } from "${FREON_CORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
        import { ${checkerInterfaceName} } from "./${Names.validator(language)}";

        /**
         * Class ${checkerClassName} is part of the implementation of the default validator.
         * It checks whether non-optional properties, as such defined in the .ast definition, indeed
         * have a value.
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = ${Names.LanguageEnvironment}.getInstance().writer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${classifiersToDo.map(concept =>
            `${this.createChecksOnNonOptionalParts(concept)}`
        ).join("\n\n")}
        }`;
    }

    private createImports(language: FreLanguage): string {
        return language.units?.map(unit => `
                ${Names.classifier(unit)}`).concat(
                    language.concepts?.map(concept => `
                ${Names.concept(concept)}`).concat(
            language.interfaces?.map(intf => `
                ${Names.interface(intf)}`))).concat(
                    Names.classifier(language.modelConcept)
        ).join(", ");
    }

    private createChecksOnNonOptionalParts(concept: FreClassifier): string {
        let result: string = "";
        const locationdescription = ValidationUtils.findLocationDescription(concept);

        concept.allProperties().forEach(prop => {
            // the following is added only for non-list properties
            // empty lists should be checked using one of the validation rules
            if (!prop.isOptional && !prop.isList) {
                // if the property is of type `string`
                // then add a check on the length of the string
                let additionalStringCheck: string = null;
                if (prop.isPrimitive && (prop.type === FrePrimitiveType.string || prop.type === FrePrimitiveType.identifier)) {
                    additionalStringCheck = `|| modelelement.${prop.name}?.length === 0`;
                }

                result += `if (modelelement.${prop.name} === null || modelelement.${prop.name} === undefined ${additionalStringCheck ? additionalStringCheck : ""}) {
                    hasFatalError = true;
                    this.errorList.push(new ${Names.FreError}("Property '${prop.name}' must have a value", modelelement, ${locationdescription}, '${prop.name}', ${Names.FreErrorSeverity}.Error));
                }
                `;
            }
        });

        this.done.push(concept);

        if (result.length > 0 ) {
            return `${commentBefore}
                public execBefore${Names.classifier(concept)}(modelelement: ${Names.classifier(concept)}): boolean {
                    let hasFatalError: boolean = false;
                    ${result}
                    return hasFatalError;
                }`;
        } else {
            return ``;
        }
    }
}
