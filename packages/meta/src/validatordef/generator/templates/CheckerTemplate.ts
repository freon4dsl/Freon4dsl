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
        const commentBefore =   `/**
                                 * Checks 'modelelement' before checking its children.
                                 * Found errors are pushed onto 'errorlist'.
                                 * @param modelelement
                                 */`;
        const commentAfter =    `/**
                                 * Checks 'modelelement' after checking its children.
                                 * Found errors are pushed onto 'errorlist'.
                                 * @param modelelement
                                 */`;
        const commentNoRule =   `/**
                                 * No checks are implemented for this 'modelelement'.
                                 * @param modelelement
                                 */`;

        // the template starts here
        return `
        import { ${errorClassName}, ${typerInterfaceName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language, validdef)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        import { ${workerInterfaceName} } from "${relativePath}${PathProvider.workerInterface(language)}";     

        /**
         * Class ${checkerClassName} is part of the implementation of the validator generated from, if present, 
         * the validator definition, using the visitor pattern. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} implements ${workerInterfaceName} {
            // 'myUnparser' is used to provide error messages on the nodes in the model tree
            myUnparser: ${unparserInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).unparser;
            // 'typer' is used to implment the 'typecheck' rules in the validator definition 
            typer: ${typerInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).typer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${validdef.conceptRules.map(ruleSet =>
            `${commentBefore}
            public execBefore${ruleSet.conceptRef.referred.name}(modelelement: ${ruleSet.conceptRef.referred.name}) {
                ${this.createRules(ruleSet)}
            }
            
            ${commentAfter}
            public execAfter${ruleSet.conceptRef.referred.name}(modelelement: ${ruleSet.conceptRef.referred.name}) {
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `${commentNoRule}
            public execBefore${concept.name}(modelelement: ${concept.name}) {
            }
            
            ${commentNoRule}
            public execAfter${concept.name}(modelelement: ${concept.name}) {
            }`
        ).join("\n\n") }
        
        /**
         * Returns true if 'name' is a valid identifier
         * @param name
         */
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
        }    
        `;
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
                        this.errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", modelelement));
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
