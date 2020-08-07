import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { ValidationUtils } from "../ValidationUtils";

export class NonOptionalsCheckerTemplate {
    done : PiConcept[] = [];
    constructor() {
    }

    generateChecker(language: PiLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.nonOptionalsChecker(language);
        const unparserInterfaceName: string = Names.PiUnparser;
        const commentBefore =   `/**
                                 * Checks 'modelelement' before checking its children.
                                 * Found errors are pushed onto 'errorlist'.
                                 * If an error is found, it is considered 'fatal', which means that no other checks on 
                                 * 'modelelement' are performed.
                                 
                                 * @param modelelement
                                 */`;
        this.done = [];

        // TODO do not generate a method for concepts that have no non-optional parts

        // the template starts here
        return `
        import { ${errorClassName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        import { ${defaultWorkerName} } from "${relativePath}${PathProvider.defaultWorker(language)}";   

        /**
         * Class ${checkerClassName} is part of the implementation of the default validator. 
         * It checks whether non-optional properties, as such defined in the .lang definition, indeed
         * have a value.
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} {
            // 'myUnparser' is used to provide error messages on the nodes in the model tree
            myUnparser: ${unparserInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).unparser;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${language.concepts.map(concept =>
            `${commentBefore}
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}): boolean {
                let hasFatalError: boolean = false;
                ${this.createChecksOnNonOptionalParts(concept)}
                return hasFatalError;
            }`
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
            if (!prop.isOptional && !prop.isList) {
                // empty lists can be checked using one of the validation rules
                result += `if (modelelement.${prop.name} == null || modelelement.${prop.name} == undefined ) {
                    hasFatalError = true;
                    this.errorList.push(new PiError("Property '${prop.name}' must have a value", modelelement, ${locationdescription}));
                }
                `
            }
        });

        this.done.push(concept);
        return result;
    }
}
