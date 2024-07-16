import {
    CONFIGURATION_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    FREON_CORE,
    LANGUAGE_GEN_FOLDER
} from "../../../utils/index.js";
import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { ValidatorDef } from "../../metalanguage/index.js";

export class ValidatorTemplate {
    errorClassName: string = Names.FreError;
    validatorInterfaceName: string = Names.FreValidator;
    typerInterfaceName: string = Names.FreTyper;

    generateValidator(language: FreMetaLanguage, validdef: ValidatorDef | undefined, relativePath: string): string {
        const doValidDef: boolean = validdef !== null && validdef !== undefined;

        const allLangConcepts: string = Names.allConcepts();
        const generatedClassName: string = Names.validator(language);
        const rulesChecker: string = Names.rulesChecker(language);
        const nonOptionalsChecker: string = Names.nonOptionalsChecker(language);
        const referenceChecker: string = Names.referenceChecker(language);
        const walkerClassName: string = Names.walker(language);
        const workerInterfaceName: string = Names.workerInterface(language);

        // Template starts here
        return `
        import { ${this.validatorInterfaceName}, ${this.errorClassName}, ${this.typerInterfaceName}, ${Names.FreNode} } from "${FREON_CORE}";
        // import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${nonOptionalsChecker} } from "./${nonOptionalsChecker}";
        ${doValidDef ? `import { ${rulesChecker} } from "./${rulesChecker}";` : ``}
        import { ${referenceChecker} } from "./${referenceChecker}";
        import { ${walkerClassName}, ${workerInterfaceName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
        import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}";

        /**
         * Interface '${Names.checkerInterface(language)}' represents any object that traverses the model tree and checks
         * its nodes, where any errors are deposited in 'errorList'.
         * Every checker that is used by the validator '${generatedClassName}' should implement this interface.
         */
        export interface ${Names.checkerInterface(language)} extends ${workerInterfaceName} {
            errorList: ${this.errorClassName}[];
        }

        /**
         * Class ${generatedClassName} implements the validator generated from, if present, the validator definition,
         * otherwise this class implements the default validator.
         * The implementation uses the visitor pattern to traverse the tree. Class ${walkerClassName} implements
         * the actual checking of each node in the tree.
         */
        export class ${generatedClassName} implements ${this.validatorInterfaceName} {

            /**
             * Returns the list of errors found in 'modelelement'.
             * This method uses the visitor pattern to traverse the tree with 'modelelement' as top node,
             * where classes ${nonOptionalsChecker}, ${referenceChecker},  implements the actual checking of each node in the tree.
             *
             * @param modelelement
             * @param includeChildren if true, the children of 'modelelement' are also checked.
             * The default for 'includeChildren' is true.
             */
            public validate(modelelement: ${allLangConcepts}, includeChildren: boolean = true) : ${this.errorClassName}[]{
                // initialize the errorlist
                const errorlist : ${this.errorClassName}[] = [];

                // create the walker over the model tree
                const myWalker = new ${walkerClassName}();

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
                ${doValidDef ? `
                    // create the checker based on the rules in the validation definition (.valid file)
                    myChecker = new ${rulesChecker}();
                    myChecker.errorList = errorlist;
                    // and add the checker to the walker
                    myWalker.myWorkers.push( myChecker );`
                : `` }

                // add any custom validations
                for (let checker of freonConfiguration.customValidations) {
                    checker.errorList = errorlist;
                    myWalker.myWorkers.push(checker);
                }

                // do the work
                myWalker.walk(modelelement, ()=> { return includeChildren; } );

                // return any errors
                return errorlist;
            }
        }`;
    }

    generateGenIndex(language: FreMetaLanguage, validdef: ValidatorDef | undefined): string {
        return `
        export * from "./${Names.nonOptionalsChecker(language)}";
        export * from "./${Names.validator(language)}";
        ${!!validdef ? `export * from "./${Names.rulesChecker(language)}";` : ``}
        `;
    }

    generateCustomValidator(language: FreMetaLanguage, relativePath: string): string {
        const className: string = Names.customValidator(language);
        const defaultWorkerName: string = Names.defaultWorker(language);
        const interfaceName: string = Names.checkerInterface(language);
        const validatorName: string = Names.validator(language);
        return `
        import { ${Names.FreError}, ${Names.FreErrorSeverity} } from "${FREON_CORE}";
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}/${defaultWorkerName}";
        import { ${interfaceName} } from "./gen/${validatorName}";

        export class ${className} extends ${defaultWorkerName} implements ${interfaceName} {
            errorList: ${Names.FreError}[] = [];
        }`;
    }

    generateIndex(language: FreMetaLanguage) {
        return `
        export * from "./${Names.customValidator(language)}";
        `;
    }
}
