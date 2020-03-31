import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";

export class ValidatorTemplate {
    constructor() {
    }

    generateValidator(language: PiLanguageUnit, validdef: PiValidatorDef, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : string = Names.validator(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.checker(language);
        const walkerClassName: string = Names.walker(language);
        const validatorInterfaceName: string = Names.PiValidator;
        const typerInterfaceName: string = Names.PiTyper;

        // Template starts here 
        return `
        import { ${validatorInterfaceName}, ${errorClassName}, ${typerInterfaceName} } from "${PathProvider.corePath}";
        import { ${allLangConcepts} } from "${relativePath}${PathProvider.allConcepts(language)}";
        import { ${checkerClassName} } from "${relativePath}${PathProvider.checker(language)}";
        import { ${walkerClassName} } from "${relativePath}${PathProvider.walker(language)}";

        export class ${generatedClassName} implements ${validatorInterfaceName} {
            myTyper : ${typerInterfaceName};

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${errorClassName}[]{
                let myChecker = new ${checkerClassName}();
                let errorlist : ${errorClassName}[] = [];
                myChecker.errorList = errorlist;
                myChecker.typer = this.myTyper;

                let myWalker = new ${walkerClassName}();
                myWalker.myWorker = myChecker;
                myWalker.walk(modelelement, includeChildren );

                return errorlist;
            }
        }`;
    }
}
