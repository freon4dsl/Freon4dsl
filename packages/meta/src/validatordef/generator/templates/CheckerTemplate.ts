import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef, EqualsTypeRule, LangRefExpression, EnumRefExpression, ThisExpression, ConformsTypeRule, NotEmptyRule, ValidNameRule, ConceptRuleSet } from "../../metalanguage/ValidatorDefLang";

export class CheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        console.log(`Creating ${Names.checker(language, validdef)}`);
        // this.createRules(validdef);
        
        // the template starts here
        return `
        import { ${Names.errorClassName()}, ${Names.typerInterface()} } from "@projectit/core";
        import { ${this.createImports(language, validdef)} } from "../../language";     

        export class ${language.name}Checker {
        ${validdef.conceptRules.map(ruleSet =>
            `public check${ruleSet.conceptRef.concept().name}(modelelement: ${ruleSet.conceptRef.concept().name}, typer: ${Names.typerInterface()}) : ${Names.errorClassName()}[] {
                let result: PiError[] = [];
                ${this.createRules(ruleSet)}
                return result;
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `public check${concept.name}(modelelement: ${concept.name}, typer: ${Names.typerInterface()}) : ${Names.errorClassName()}[] {
                return null;
            }`
        ).join("\n\n") }
        
        private isValidName(name: string) : boolean {
            // cannot start with number
            if (/[A-Z]/.test( name[0]) ) return false; 
            // may contain letters, number, '$', and '_', but no other characters
            if (/[.,|!?@~%^&*-=+(){}[]"':;<>?\\/\\\]/.test( name ) ) return false; 
            // may not contain spaces
            if (/[ ]/.test( name[0]) ) return false; 
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
                ${(r instanceof EqualsTypeRule ?
                    `if(!typer.equalsType(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        result.push(new PiError("Type of '${r.type1.toPiString()}' should be ${r.type2.toPiString()}", ${this.langRefToTypeScript(r.type1)}));
                    }`
                : (r instanceof ConformsTypeRule ?
                    `if(!typer.conformsTo(${this.langRefToTypeScript(r.type1)}, ${this.langRefToTypeScript(r.type2)})) {
                        result.push(new PiError("Type of '${r.type1.toPiString()}' does not conform to type of '${r.type2.toPiString()}'", ${this.langRefToTypeScript(r.type1)}));
                    }`           
                : (r instanceof NotEmptyRule ?
                    `if(${this.langRefToTypeScript(r.property)}.length == 0) {
                        result.push(new PiError("List of ${r.property.toPiString()} may not be empty", ${this.langRefToTypeScript(r.property)}));
                    }`
                : (r instanceof ValidNameRule ?
                    `if(this.isValidName(${this.langRefToTypeScript(r.property)})) {
                        result.push(new PiError("'${r.property.toPiString()}' is not a valid identifier", ${this.langRefToTypeScript(r.property)}));
                    }`
                : ""))))}`
            ).join("\n")}`;
    }

    private langRefToTypeScript(ref: LangRefExpression): string {
        if (ref instanceof EnumRefExpression) {
            return `${ref.sourceName}.${ref.literalName}`;
        } else if (ref instanceof ThisExpression) {
            return `modelelement.${ref.appliedFeature.toPiString()}`;
        } else {
            return ref.toPiString();
        }
    }

    private conceptsWithoutRules(language: PiLanguageUnit, validdef: PiValidatorDef) : PiLangConcept[] {
        let withRules : PiLangConcept[] = [];
        for (let ruleSet of validdef.conceptRules) {
            withRules.push(ruleSet.conceptRef.concept());
        }
        let withoutRules : PiLangConcept[] = [];
        for( let c of language.concepts) {
            if( !withRules.includes(c) ) withoutRules.push(c);
        }
        return withoutRules;
    }
}
