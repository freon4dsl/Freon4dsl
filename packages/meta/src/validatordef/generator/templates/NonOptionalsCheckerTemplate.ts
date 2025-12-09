import { Names, Imports } from "../../../utils/on-lang/index.js"
import type { FreMetaLanguage, FreMetaClassifier} from "../../../languagedef/metalanguage/index.js";
import { FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { ValidationUtils } from "../ValidationUtils.js";

const paramName: string = "node";
const commentBefore = `/**
                        * Checks '${paramName}' before checking its children.
                        * Found errors are pushed onto 'errorlist'.
                        * If an error is found, it is NOT considered 'fatal', which means that other checks on
                        * '${paramName}' are performed.
                        *
                        * @param ${paramName}
                        */`;

export class NonOptionalsCheckerTemplate {
    done: FreMetaClassifier[] = [];

    generateChecker(language: FreMetaLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const errorSeverityName: string = Names.FreErrorSeverity;
        const checkerClassName: string = Names.nonOptionalsChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const writerInterfaceName: string = Names.FreWriter;
        const classifiersToDo: FreMetaClassifier[] = [];
        classifiersToDo.push(language.modelConcept);
        classifiersToDo.push(...language.units);
        classifiersToDo.push(...language.concepts);
        this.done = [];

        // the template starts here, imports are added after the generation
        const result = `
        /**
         * Class ${checkerClassName} is part of the implementation of the default validator.
         * It checks whether non-optional properties, as such defined in the .ast definition, indeed
         * have a value.
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = ${Names.FreLanguageEnvironment}.getInstance().writer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${classifiersToDo.map((concept) => `${this.createChecksOnNonOptionalParts(concept)}`).join("\n\n")}
        }`;

        const imports = new Imports(relativePath)
        imports.core = new Set<string>([errorClassName, errorSeverityName, writerInterfaceName, Names.FreLanguageEnvironment, Names.isNullOrUndefined])
        imports.language = new Set<string>(this.done.map(cls => Names.classifier(cls)) )
        imports.utils.add(defaultWorkerName)
        
        return `
        // TEMPLATE: NonOptionalsCheckerTemplate.generateChecker(...)
        ${imports.makeImports(language)}
        import { type ${checkerInterfaceName} } from "./${Names.validator(language)}.js";
        
        ${result}`;
    }

    private createChecksOnNonOptionalParts(concept: FreMetaClassifier): string {
        let result: string = "";
        const locationdescription = ValidationUtils.findLocationDescription(concept, paramName);

        concept.allProperties().forEach((prop) => {
            // the following is added only for non-list properties
            // empty lists should be checked using one of the validation rules
            if (!prop.isOptional && !prop.isList) {
                // if the property is of type `string`
                // then add a check on the length of the string
                let additionalStringCheck: string = "";
                if (
                    prop.isPrimitive &&
                    (prop.type === FreMetaPrimitiveType.string || prop.type === FreMetaPrimitiveType.identifier)
                ) {
                    additionalStringCheck = `|| ${paramName}.${prop.name}?.length === 0`;
                }

                result += `if (${Names.isNullOrUndefined}(${paramName}.${prop.name}) ${additionalStringCheck}) {
                    this.errorList.push(new ${Names.FreError}("Property '${prop.name}' must have a value", ${paramName}, ${locationdescription}, '${prop.name}', ${Names.FreErrorSeverity}.Error));
                }
                `;
            }
        });

        if (result.length > 0) {
            this.done.push(concept);
            return `${commentBefore}
                public execBefore${Names.classifier(concept)}(${paramName}: ${Names.classifier(concept)}): boolean {
                    ${result}
                    return false;
                }`;
        } else {
            return ``;
        }
    }
}
