import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";
import { PathProvider } from "utils/PathProvider";

export class ValidatorTemplate {
    constructor() {
    }

    generateValidator(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : string = Names.validator(language, validdef);
        const walkerName: string = Names.walker(language);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${Names.validatorInterface()}, ${Names.errorClassName()}, ${Names.typerInterface()} } from "${PathProvider.errorClass()}";
        import { ${Names.checker(language,validdef)} } from "./${PathProvider.checker(language)}";
        import { ${walkerName} } from "../../../demo/utils/gen/${walkerName}";

        export class ${generatedClassName} implements ${Names.validatorInterface()} {
            myTyper : ${Names.typerInterface()};

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${Names.errorClassName()}[]{
                let myChecker = new ${Names.checker(language, validdef)}();
                let errorlist : ${Names.errorClassName()}[] = [];
                myChecker.errorList = errorlist;
                myChecker.typer = this.myTyper;

                let myWalker = new ${walkerName}();
                myWalker.myWorker = myChecker;
                myWalker.walk(modelelement, includeChildren );

                return errorlist;
            }
        }`;
    }
}
