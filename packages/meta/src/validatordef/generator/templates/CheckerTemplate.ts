import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, langExpToTypeScript, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef, CheckEqualsTypeRule, CheckConformsRule, NotEmptyRule, ValidNameRule, ConceptRuleSet } from "../../metalanguage/ValidatorDefLang";

export class CheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguageUnit, validdef: PiValidatorDef, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.checker(language);
        const typerInterfaceName: string = Names.PiTyper;
        const unparserInterfaceName: string = Names.PiUnparser;

        // the template starts here
        return `
        import { ${errorClassName}, ${typerInterfaceName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language, validdef)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        import { ${workerInterfaceName} } from "${relativePath}${PathProvider.workerInterface(language)}";
        

        export class ${checkerClassName} implements ${workerInterfaceName} {
            myUnparser: ${unparserInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).unparser;
            typer: ${typerInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).typer;
            errorList: ${errorClassName}[] = [];

        ${validdef.conceptRules.map(ruleSet =>
            `public execBefore${ruleSet.conceptRef.referred.name}(modelelement: ${ruleSet.conceptRef.referred.name}) {
                ${this.createRules(ruleSet)}
            }
            public execAfter${ruleSet.conceptRef.referred.name}(modelelement: ${ruleSet.conceptRef.referred.name}) {
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `public execBefore${concept.name}(modelelement: ${concept.name}) {
            }
            public execAfter${concept.name}(modelelement: ${concept.name}) {
            }`
        ).join("\n\n") }
        
        private isValidName(name: string) : boolean {
            if (!(!!name)) return false;
            // cannot start with number
            if (/[0-9]/.test( name[0]) ) return false; 
            // may contain letters, numbers, '$', and '_', but no other characters
            if (/[.|,|!|?|@|~|%|^|&|*|-|=|+|(|)|{|}|"|'|:|;|<|>|?]/.test( name ) ) return false; 
            if (/\\\\/.test(name)) return false;
            if (/[\/|\[|\]]/.test(name)) return false;
            // may not contain whitespaces
            if (/[\\t|\\n|\\r| ]/.test(name)) return false;
            // may not be a Typescript keyword
            // TODO implement this
            return true;
            }
        }`;
    }

    private createImports(language: PiLanguageUnit, validdef: PiValidatorDef) : string {
        let result : string = "";
        result = language.concepts?.map(concept => `
                ${concept.name}`).join(", ");
        result = result.concat(language.concepts? `,` :``);
        result = result.concat(
            language.interfaces?.map(concept => `
                ${concept.name}`).join(", "));
        return result;
    }

    private createRules(ruleSet: ConceptRuleSet) : string {
       return `${
            ruleSet.rules.map(r => 
                `// ${r.toPiString()}
                ${(r instanceof CheckEqualsTypeRule ?
                    `if(!this.typer.equalsType(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type1)}) 
                        + "' should be equal to (the type of) '" + this.myUnparser.unparse(${langExpToTypeScript(r.type2)}) + "'", ${langExpToTypeScript(r.type1)}));
                    }`
                : (r instanceof CheckConformsRule ?
                    `if(!this.typer.conformsTo(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type1)}) + 
                        "' does not conform to (the type of) '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type2)}) + "'", ${langExpToTypeScript(r.type1)}));
                    }`           
                : (r instanceof NotEmptyRule ?
                    `if(${langExpToTypeScript(r.property)}.length == 0) {
                        this.errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", ${langExpToTypeScript(r.property)}));
                    }`
                : (r instanceof ValidNameRule ?
                    `if(!this.isValidName(${langExpToTypeScript(r.property)})) {
                        this.errorList.push(new PiError("'" + ${langExpToTypeScript(r.property)} + "' is not a valid identifier", modelelement));
                    }`
                : ""))))}`
            ).join("\n")}`;
    }


    private conceptsWithoutRules(language: PiLanguageUnit, validdef: PiValidatorDef) : PiConcept[] {
        let withRules : PiConcept[] = [];
        for (let ruleSet of validdef.conceptRules) {
            withRules.push(ruleSet.conceptRef.referred);
        }
        let withoutRules : PiConcept[] = [];
        for( let c of language.concepts) {
            if( !withRules.includes(c) ) withoutRules.push(c);
        }
        return withoutRules;
    }
}
