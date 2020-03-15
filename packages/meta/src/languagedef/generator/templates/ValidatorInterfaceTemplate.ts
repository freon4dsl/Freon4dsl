import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class ValidatorInterfaceTemplate {
    generateValidatorInterface(language: PiLanguageUnit) : string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const validatorInterfaceName : String = Names.validatorInterface(language);
        const errorClassName : String = Names.errorClassName(language);
    
        return `
        import { ${allLangConcepts} } from "./${allLangConcepts}";
        
        export interface ${validatorInterfaceName} {

            validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${errorClassName}[];
        }
        
        export class ${errorClassName} {
            message: string;
            reportedOn: ${allLangConcepts} | ${allLangConcepts}[];

            constructor(mess:string, elem: ${allLangConcepts} | ${allLangConcepts}[]) {
                this.message = mess;
                this.reportedOn = elem;
            }
        }
        `;
    }
}
