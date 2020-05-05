import { ENVIRONMENT_GEN_FOLDER, Names, PathProvider, PROJECTITCORE } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";

export class ValidatorTemplate {
    errorClassName : string = Names.PiError;
    validatorInterfaceName: string = Names.PiValidator;
    typerInterfaceName: string = Names.PiTyper;

    constructor() {
    }

    generateValidator(language: PiLanguageUnit, validdef: PiValidatorDef, relativePath: string): string {

        if (validdef === null || validdef === undefined) return this.generateDefault(language, relativePath);

        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.validator(language);
        const checkerClassName: string = Names.checker(language);
        const walkerClassName: string = Names.walker(language);
    
        // Template starts here 
        return `
        import { ${this.validatorInterfaceName}, ${this.errorClassName}, ${this.typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${PathProvider.allConcepts(language)}";
        import { ${checkerClassName} } from "${relativePath}${PathProvider.checker(language)}";
        import { ${walkerClassName} } from "${relativePath}${PathProvider.walker(language)}"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

        export class ${generatedClassName} implements ${this.validatorInterfaceName} {

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${this.errorClassName}[]{
                let myChecker = new ${checkerClassName}();
                let errorlist : ${this.errorClassName}[] = [];
                myChecker.errorList = errorlist;
 
                let myWalker = new ${walkerClassName}();
                myWalker.myWorker = myChecker;
                myWalker.walk(modelelement, includeChildren );

                return errorlist;
            }
        }`;
    }

    generateDefault(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.validator(language);

        // Template starts here 
        return `
        import { ${this.validatorInterfaceName}, ${this.errorClassName}, ${this.typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${PathProvider.allConcepts(language)}";

        export class ${generatedClassName} implements ${this.validatorInterfaceName} {
            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${this.errorClassName}[]{
                let errorList : ${this.errorClassName}[] = [];
                errorList.push(new ${this.errorClassName}("No validator found.", modelelement));
                return errorList;
            }
        }`;
    }

    generateIndex(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        return `
        export * from "./${Names.validator(language)}";
        ${!!validdef ? `export * from "./${Names.checker(language)}";` : ``}
        `;
    }

}
