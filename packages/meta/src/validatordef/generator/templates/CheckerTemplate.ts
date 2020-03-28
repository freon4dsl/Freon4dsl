import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef, CheckEqualsTypeRule, CheckConformsRule, NotEmptyRule, ValidNameRule, ConceptRuleSet } from "../../metalanguage/ValidatorDefLang";
import { PiLangEnumerationReference } from "../../../languagedef/metalanguage/PiLangReferences";
import { PiLangAppliedFeatureExp, PiLangThisExp, PiLangExp, PiLangEnumExp } from "../../../languagedef/metalanguage/PiLangExpressions";

export class CheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        
        // the template starts here
        return `
        import { ${Names.errorClassName()}, ${Names.typerInterface()} } from "@projectit/core";
        import { ${this.createImports(language, validdef)} } from "../../language"; 
        import { ${Names.unparser(language)} } from "../../../demo/unparser/${Names.unparser(language)}";    

        export class ${language.name}Checker {
            myUnparser = new ${Names.unparser(language)}();
        ${validdef.conceptRules.map(ruleSet =>
            `public check${ruleSet.conceptRef.referedElement().name}(modelelement: ${ruleSet.conceptRef.referedElement().name}, typer: ${Names.typerInterface()}, errorList: ${Names.errorClassName()}[]) {
                ${this.createRules(ruleSet)}
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `public check${concept.name}(modelelement: ${concept.name}, typer: ${Names.typerInterface()}, errorList: ${Names.errorClassName()}[]) {
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
                    `if(!typer.equalsType(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type1)}) 
                        + "' should be equal to (the type of) '" + this.myUnparser.unparse(${this.langRefToTypeScript(r.type2)}) + "'", ${this.langRefToTypeScript(r.type1)}));
                    }`
                : (r instanceof CheckConformsRule ?
                    `if(!typer.conformsTo(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type1)}) + 
                        "' does not conform to (the type of) '"+ this.myUnparser.unparse(${this.langRefToTypeScript(r.type2)}) + "'", ${this.langRefToTypeScript(r.type1)}));
                    }`           
                : (r instanceof NotEmptyRule ?
                    `if(${this.langRefToTypeScript(r.property)}.length == 0) {
                        errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", ${this.langRefToTypeScript(r.property)}));
                    }`
                : (r instanceof ValidNameRule ?
                    `if(!this.isValidName(modelelement.${this.langRefToTypeScript(r.property)})) {
                        errorList.push(new PiError("'" + modelelement.${this.langRefToTypeScript(r.property)} + "' is not a valid identifier", ${this.langRefToTypeScript(r.property)}));
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
