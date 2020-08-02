import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, langExpToTypeScript, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiConcept, PiLangElement, PiProperty, PiPrimitiveProperty } from "../../../languagedef/metalanguage/PiLanguage";
import {
    PiValidatorDef,
    CheckEqualsTypeRule,
    CheckConformsRule,
    NotEmptyRule,
    ValidNameRule,
    ConceptRuleSet,
    ExpressionRule, IsuniqueRule
} from "../../metalanguage/ValidatorDefLang";

export class CheckerTemplate {
    constructor() {
    }

    generateChecker(language: PiLanguage, validdef: PiValidatorDef, relativePath: string): string {
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
            public execBefore${Names.concept(ruleSet.conceptRef.referred)}(modelelement: ${Names.concept(ruleSet.conceptRef.referred)}) {
                ${this.createRules(ruleSet)}
            }
            
            ${commentAfter}
            public execAfter${Names.concept(ruleSet.conceptRef.referred)}(modelelement: ${Names.concept(ruleSet.conceptRef.referred)}) {
            }`
        ).join("\n\n")}

        ${this.conceptsWithoutRules(language, validdef).map(concept => 
            `${commentNoRule}
            public execBefore${Names.concept(concept)}(modelelement: ${Names.concept(concept)}) {
            }
            
            ${commentNoRule}
            public execAfter${Names.concept(concept)}(modelelement: ${Names.concept(concept)}) {
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

    private createImports(language: PiLanguage, validdef: PiValidatorDef) : string {
        let result : string = "";
        result = language.concepts?.map(concept => `
                ${Names.concept(concept)}`).join(", ");
        result = result.concat(language.concepts? `,` :``);
        result = result.concat(
            language.interfaces?.map(intf => `
                ${Names.interface(intf)}`).join(", "));
        return result;
    }

    private createRules(ruleSet: ConceptRuleSet) : string {
        // find the property that indicates the location in human terms
        let myType = ruleSet.conceptRef.referred;
        let nameProp = myType.allPrimProperties().find(prop => prop.name === 'name');
        if (!(!!nameProp)) {
            nameProp = myType.allPrimProperties().find(prop => prop.primType === 'string');
        }
        let locationdescription = !!nameProp ? `modelelement.${nameProp.name}` : `"--"`;
        //
        return `${
            ruleSet.rules.map(r => 
                `// ${r.toPiString()}
                ${(r instanceof CheckEqualsTypeRule ?
                    `if(!this.typer.equalsType(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type1)}, 0, true) 
                        + "' should be equal to (the type of) '" + this.myUnparser.unparse(${langExpToTypeScript(r.type2)}, 0, true) + "'", ${langExpToTypeScript(r.type1)}, ${locationdescription}));
                    }`
                : (r instanceof CheckConformsRule ?
                    `if(!this.typer.conformsTo(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                        this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type1)}, 0, true) + 
                        "' does not conform to (the type of) '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type2)}, 0, true) + "'", ${langExpToTypeScript(r.type1)}, ${locationdescription}));
                    }`           
                : (r instanceof NotEmptyRule ?
                    `if(${langExpToTypeScript(r.property)}.length == 0) {
                        this.errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", modelelement, ${locationdescription}));
                    }`
                : (r instanceof ValidNameRule ?
                    `if(!this.isValidName(${langExpToTypeScript(r.property)})) {
                        this.errorList.push(new PiError("'" + ${langExpToTypeScript(r.property)} + "' is not a valid identifier", modelelement, ${locationdescription}));
                    }` 
                : (r instanceof ExpressionRule ?
                    `if(!(${langExpToTypeScript(r.exp1)} ${r.comparator} ${langExpToTypeScript(r.exp2)})) {
                        this.errorList.push(new PiError("'${r.toPiString()}' is false", modelelement, ${locationdescription}));
                    }`
                : (r instanceof IsuniqueRule ?
                    `${this.makeIsuniqueRule(r, locationdescription)}`
                : ""))))))}`
            ).join("\n")}`;
    }

    private makeIsuniqueRule(rule: IsuniqueRule, locationdescription: string): string {
        const listpropertyName = rule.listproperty.appliedfeature.toPiString();
        const listName = rule.list.appliedfeature.toPiString();
        const uniquelistName = `unique${Names.startWithUpperCase(listpropertyName)}In${Names.startWithUpperCase(listName)}`;
        const referredListproperty = rule.listproperty.findRefOfLastAppliedFeature();
        const listpropertyTypeName = (referredListproperty instanceof PiPrimitiveProperty) ? referredListproperty.primType :referredListproperty.type.referred.name;
        const listpropertyTypescript = langExpToTypeScript(rule.listproperty.appliedfeature);
        return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${langExpToTypeScript(rule.list)}.forEach((elem, index) => {
            if (!${uniquelistName}.includes(elem.${listpropertyTypescript})){
                ${uniquelistName}.push(elem.${listpropertyTypescript});
            } else {
                this.errorList.push(new PiError("The value of property '${listpropertyName}' is not unique in list '${listName}'", ${langExpToTypeScript(rule.list)}[index], ${locationdescription}));
            }
        });`;
    }
    private conceptsWithoutRules(language: PiLanguage, validdef: PiValidatorDef) : PiConcept[] {
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
