import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiLangConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef, CheckEqualsTypeRule, CheckConformsRule, NotEmptyRule, ValidNameRule, ConceptRuleSet } from "../../metalanguage/ValidatorDefLang";
import { PiLangThisExp, PiLangExp, PiLangEnumExp } from "../../../languagedef/metalanguage/PiLangExpressions";

export class CheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguageUnit, validdef: PiValidatorDef, relativePath: string): string {
        const workerInterfaceName = Names.workerInterface(language);
        const errorClassName : string = Names.PiError;
        const checkerClassName : string = Names.checker(language);
        const typerInterfaceName: string = Names.PiTyper;
        const unparserClassName: string = Names.unparser(language);
        
        // the template starts here
        return `
        import { ${errorClassName}, ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language, validdef)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${unparserClassName} } from "${relativePath}${PathProvider.unparser(language)}";    
        import { ${workerInterfaceName} } from "${relativePath}${PathProvider.workerInterface(language)}";

        export class ${checkerClassName} implements ${workerInterfaceName} {
            myUnparser = new ${unparserClassName}();
            typer: ${typerInterfaceName};
            errorList: ${errorClassName}[] = [];

        ${validdef.conceptRules.map(ruleSet =>
            `public execBefore${ruleSet.conceptRef.referedElement().name}(modelelement: ${ruleSet.conceptRef.referedElement().name}) {
                ${this.createRules(ruleSet)}
            }
            public execAfter${ruleSet.conceptRef.referedElement().name}(modelelement: ${ruleSet.conceptRef.referedElement().name}) {
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `public execBefore${concept.name}(modelelement: ${concept.name}) {
            }
            public execAfter${concept.name}(modelelement: ${concept.name}) {
            }`
        ).join("\n\n") }
        
        ${language.enumerations.map(concept => 
            `public execBefore${concept.name}(modelelement: ${concept.name}) {
            }
            public execAfter${concept.name}(modelelement: ${concept.name}) {
            }`
        ).join("\n\n") }

        private isValidName(name: string) : boolean {
            if (name == null) return false;
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
        result = language.classes?.map(concept => `
                ${concept.name}`).join(", ");
        result = result.concat(language.classes? `,` :``);
        result = result.concat(
            language.enumerations?.map(concept => `
                ${concept.name}`).join(", "));
        result = result.concat(language.enumerations? `,` :``);
        result = result.concat(
            language.unions?.map(concept => `
                ${concept.name}`).join(", "));
        result = result.concat(language.unions? `,` :``);
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
                    `if(!this.typer.equalsType(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type1)}) 
                        + "' should be equal to (the type of) '" + this.myUnparser.unparse(${this.langRefToTypeScript(r.type2)}) + "'", ${this.langRefToTypeScript(r.type1)}));
                    }`
                : (r instanceof CheckConformsRule ?
                    `if(!this.typer.conformsTo(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type1)}) + 
                        "' does not conform to (the type of) '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type2)}) + "'", ${this.langRefToTypeScript(r.type1)}));
                    }`           
                : (r instanceof NotEmptyRule ?
                    `if(${this.langRefToTypeScript(r.property)}.length == 0) {
                        this.errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", ${this.langRefToTypeScript(r.property)}));
                    }`
                : (r instanceof ValidNameRule ?
                    `if(!this.isValidName(${this.langRefToTypeScript(r.property)})) {
                        this.errorList.push(new PiError("'" + ${this.langRefToTypeScript(r.property)} + "' is not a valid identifier", modelelement));
                    }`
                : ""))))}`
            ).join("\n")}`;
    }

    private langRefToTypeScript(ref: PiLangExp): string {
        // console.log(" generating " + ref.toPiString());
        if (ref instanceof PiLangEnumExp) {
            return `${ref.sourceName}.${ref.appliedfeature}`;
        } else if (ref instanceof PiLangThisExp) {
            return `modelelement.${ref.appliedfeature.toPiString()}`;
        } else {
            return ref.toPiString();
        }
    }

    private conceptsWithoutRules(language: PiLanguageUnit, validdef: PiValidatorDef) : PiLangConcept[] {
        let withRules : PiLangConcept[] = [];
        for (let ruleSet of validdef.conceptRules) {
            withRules.push(ruleSet.conceptRef.referedElement());
        }
        let withoutRules : PiLangConcept[] = [];
        for( let c of language.classes) {
            if( !withRules.includes(c) ) withoutRules.push(c);
        }
        return withoutRules;
    }
}
