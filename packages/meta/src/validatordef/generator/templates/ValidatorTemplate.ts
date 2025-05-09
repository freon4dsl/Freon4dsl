import {
    CONFIGURATION_FOLDER,
    Names,
    Imports
} from "../../../utils/index.js"
import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { ValidatorDef } from "../../metalanguage/index.js";

export class ValidatorTemplate {
    errorClassName: string = Names.FreError;
    validatorInterfaceName: string = Names.FreValidator;

    generateValidator(language: FreMetaLanguage, validdef: ValidatorDef | undefined, relativePath: string): string {
        const doValidDef: boolean = validdef !== null && validdef !== undefined;

        const generatedClassName: string = Names.validator(language);
        const rulesChecker: string = Names.rulesChecker(language);
        const nonOptionalsChecker: string = Names.nonOptionalsChecker(language);
        const referenceChecker: string = Names.referenceChecker(language);
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreValidator, this.errorClassName, Names.FreTyper, Names.FreNode
        ])
        imports.utils.add(Names.walker(language)).add(Names.workerInterface(language))
        
        // Template starts here
        return `
        // TEMPLATE: ValidatorTemplate.generateValidator(...)
        ${imports.makeImports(language)}
        import { ${nonOptionalsChecker} } from "./${nonOptionalsChecker}.js";
        ${doValidDef ? `import { ${rulesChecker} } from "./${rulesChecker}.js";` : ``}
        import { ${referenceChecker} } from "./${referenceChecker}.js";
        import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}.js";

        /**
         * Interface '${Names.checkerInterface(language)}' represents any object that traverses the model tree and checks
         * its nodes, where any errors are deposited in 'errorList'.
         * Every checker that is used by the validator '${generatedClassName}' should implement this interface.
         */
        export interface ${Names.checkerInterface(language)} extends ${Names.workerInterface(language)} {
            errorList: ${this.errorClassName}[];
        }

        /**
         * Class ${generatedClassName} implements the validator generated from, if present, the validator definition,
         * otherwise this class implements the default validator.
         * The implementation uses the visitor pattern to traverse the tree. Class ${Names.walker(language)} implements
         * the actual checking of each node in the tree.
         */
        export class ${generatedClassName} implements ${Names.FreValidator} {

            /**
             * Returns the list of errors found in 'node'.
             * This method uses the visitor pattern to traverse the tree with 'node' as top node,
             * where classes ${nonOptionalsChecker}, ${referenceChecker},  implements the actual checking of each node in the tree.
             *
             * @param node
             * @param includeChildren if true, the children of 'node' are also checked.
             * The default for 'includeChildren' is true.
             */
            public validate(node: ${Names.FreNode}, includeChildren: boolean = true) : ${this.errorClassName}[]{
                // initialize the errorlist
                const errorlist : ${this.errorClassName}[] = [];

                // create the walker over the model tree
                const myWalker = new ${Names.walker(language)}();

                // create the checker on non-optional parts
                let myChecker = new ${nonOptionalsChecker}();
                myChecker.errorList = errorlist;
                // and add the checker to the walker
                myWalker.myWorkers.push( myChecker );

                // create the checker on references
                myChecker = new ${referenceChecker}();
                myChecker.errorList = errorlist;
                // and add the checker to the walker
                myWalker.myWorkers.push( myChecker );
                ${
                    doValidDef
                        ? `
                    // create the checker based on the rules in the validation definition (.valid file)
                    myChecker = new ${rulesChecker}();
                    myChecker.errorList = errorlist;
                    // and add the checker to the walker
                    myWalker.myWorkers.push( myChecker );`
                        : ``
                }

                // add any custom validations
                for (let checker of freonConfiguration.customValidations) {
                    checker.errorList = errorlist;
                    myWalker.myWorkers.push(checker);
                }

                // do the work
                myWalker.walk(node, ()=> { return includeChildren; } );

                // return any errors
                return errorlist;
            }
        }`;
    }

    generateGenIndex(language: FreMetaLanguage, validdef: ValidatorDef | undefined): string {
        return `
        export * from "./${Names.nonOptionalsChecker(language)}.js";
        export * from "./${Names.validator(language)}.js";
        ${!!validdef ? `export * from "./${Names.rulesChecker(language)}.js";` : ``}
        `;
    }

    generateCustomValidator(language: FreMetaLanguage, relativePath: string): string {
        const className: string = Names.customValidator(language);
        const defaultWorkerName: string = Names.defaultWorker(language);
        const interfaceName: string = Names.checkerInterface(language);
        const validatorName: string = Names.validator(language);
        const imports = new Imports(relativePath)
        imports.core.add(Names.FreError).add(Names.FreErrorSeverity)
        imports.utils.add(defaultWorkerName)
        
        return `
        // TEMPLATE: ValidatorTemplate.generateCustomValidator
        ${imports.makeImports(language)}
        import { type ${interfaceName} } from "./gen/${validatorName}.js";

        export class ${className} extends ${defaultWorkerName} implements ${interfaceName} {
            errorList: ${Names.FreError}[] = [];
        }`;
    }

    generateIndex(language: FreMetaLanguage) {
        return `
        export * from "./${Names.customValidator(language)}.js";
        `;
    }
}
