// TODO note that the following import cannot be from "@projectit/core", because
// this leads to a load error
import { PiErrorSeverity } from "../../../../../core/src/validator/PiValidator";
import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER, langExpToTypeScript, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage, PiConcept, PiPrimitiveProperty } from "../../../languagedef/metalanguage";
import {
    PiValidatorDef,
    CheckEqualsTypeRule,
    CheckConformsRule,
    NotEmptyRule,
    ValidNameRule,
    ConceptRuleSet,
    ExpressionRule, IsuniqueRule, ValidationRule, ValidationMessage
} from "../../metalanguage";
import { ValidationUtils } from "../ValidationUtils";

export class RulesCheckerTemplate {
    done: PiConcept[] = [];

    generateRulesChecker(language: PiLanguage, validdef: PiValidatorDef, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.PiError;
        const checkerClassName: string = Names.rulesChecker(language);
        const typerInterfaceName: string = Names.PiTyper;
        const unparserInterfaceName: string = Names.PiUnparser;
        const commentBefore = `/**
                                * Checks 'modelelement' before checking its children.
                                * Found errors are pushed onto 'errorlist'.
                                * @param modelelement
                                */`;
        this.done = [];

        // TODO work further on PiErrorSeverity
        // the template starts here
        return `
        import { ${errorClassName}, PiErrorSeverity, ${typerInterfaceName}, ${unparserInterfaceName} } from "${PROJECTITCORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        import { ${defaultWorkerName} } from "${relativePath}${PathProvider.defaultWorker(language)}";   
        import { reservedWordsInTypescript } from "./ReservedWords";  

        /**
         * Class ${checkerClassName} is part of the implementation of the validator generated from, if present, 
         * the validator definition, using the visitor pattern. 
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} {
            // 'myUnparser' is used to provide error messages on the nodes in the model tree
            myUnparser: ${unparserInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).unparser;
            // 'typer' is used to implement the 'typecheck' rules in the validator definition 
            typer: ${typerInterfaceName} = (${Names.environment(language)}.getInstance() as ${Names.environment(language)}).typer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${validdef.conceptRules.map(ruleSet =>
            `${commentBefore}
            public execBefore${Names.concept(ruleSet.conceptRef.referred)}(modelelement: ${Names.concept(ruleSet.conceptRef.referred)}): boolean {
                ${this.createRules(ruleSet)}
                return true;
            }`
        ).join("\n\n")}
        
        /**
         * Returns true if 'name' is a valid identifier
         * @param name
         */
        private isValidName(name: string): boolean {
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
            if (reservedWordsInTypescript.includes(name)) return false;
            return true;
            }
        }    
        `;
    }

    private createImports(language: PiLanguage): string {
        let result: string = language.concepts?.map(concept => `
                ${Names.concept(concept)}`).join(", ");
        result = result.concat(language.concepts ? `,` : ``);
        result = result.concat(
            language.interfaces?.map(intf => `
                ${Names.interface(intf)}`).join(", "));
        return result;
    }

    private createRules(ruleSet: ConceptRuleSet): string {
        let result: string = "";
        // find the property that indicates the location in human terms
        const locationdescription = ValidationUtils.findLocationDescription(ruleSet.conceptRef.referred);

        ruleSet.rules.forEach(r => {
            // find the severity for the rule
            const severity: string = this.makeSeverity(r);

            // if this rule has a message defined by the language engineer then use it
            const message: string = this.makeMessage(r.message);

            // add a comment to the result
            result += `// ${r.toPiString()}\n`;

            // create the text for the rule
            if (r instanceof CheckEqualsTypeRule) {
                result += this.makeEqualsTypeRule(r, locationdescription, severity, message);
            } else if (r instanceof CheckConformsRule) {
                result += this.makeConformsRule(r, locationdescription, severity, message);
            } else if (r instanceof NotEmptyRule) {
                result += this.makeNotEmptyRule(r, locationdescription, severity)
            } else if (r instanceof ValidNameRule) {
                result += this.makeValidNameRule(r, locationdescription, severity)
            } else if (r instanceof ExpressionRule) {
                result += this.makeExpressionRule(r, locationdescription, severity)
            } else if (r instanceof IsuniqueRule) {
                result += this.makeIsuniqueRule(r, locationdescription, severity);
            }
        });
        return result;
    }

    private makeSeverity(r: ValidationRule): string {
        // this method makes sure that we do not depend on the name of the severity to be the same as its value
        // i.e. PiErrorSeverity.ToDo = "TODO",
        let result: string = `PiErrorSeverity.`
        switch (r.severity.severity) {
            case PiErrorSeverity.Error: {
                result += `Error`;
                break;
            }
            case PiErrorSeverity.Improvement:{
                result += `Improvement`;
                break;
            }
            case PiErrorSeverity.Info:{
                result += `Info`;
                break;
            }
            case PiErrorSeverity.NONE:{
                result += `NONE`;
                break;
            }
            case PiErrorSeverity.ToDo:{
                result += `ToDo`;
                break;
            }
        }
        return result;
    }

    private makeExpressionRule(r: ExpressionRule, locationdescription: string, severity: string) {
        return `if (!(${langExpToTypeScript(r.exp1)} ${r.comparator} ${langExpToTypeScript(r.exp2)})) {
                        this.errorList.push(new PiError("'${r.toPiString()}' is false", modelelement,
                         ${locationdescription},
                         ${severity}));
                         
                    }`;
    }

    private makeValidNameRule(r: ValidNameRule, locationdescription: string, severity: string) {
        return `if (!this.isValidName(${langExpToTypeScript(r.property)})) {
                         this.errorList.push(new PiError("'" + ${langExpToTypeScript(r.property)} + "' is not a valid identifier", modelelement,
                         ${locationdescription},
                         ${severity}));
                    }`;
    }

    private makeNotEmptyRule(r: NotEmptyRule, locationdescription: string, severity: string) {
        return `if (${langExpToTypeScript(r.property)}.length == 0) {
                         this.errorList.push(new PiError("List '${r.property.toPiString()}' may not be empty", modelelement,
                         ${locationdescription},
                         ${severity}));
                    }`;
    }

    private makeConformsRule(r: CheckConformsRule, locationdescription: string, severity: string, message?: string) {
        if (message.length === 0) {
            message = `"Type of '" + this.myUnparser.unparse(${langExpToTypeScript(r.type1)}, 0, true) + 
                         "' does not conform to (the type of) '" + this.myUnparser.unparse(${langExpToTypeScript(r.type2)}, 0, true) + "'"`;
        }
        return `if (!this.typer.conformsTo(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                         this.errorList.push(
                            new PiError(
                                 ${message},
                                 ${langExpToTypeScript(r.type1)},
                                 ${locationdescription},
                                 ${severity}
                            ));
                    }`;
    }

    private makeEqualsTypeRule(r: CheckEqualsTypeRule, locationdescription: string, severity: string, message?: string) {
        return `if (!this.typer.equalsType(${langExpToTypeScript(r.type1)}, ${langExpToTypeScript(r.type2)})) {
                         this.errorList.push(new PiError("Type of '"+ this.myUnparser.unparse(${langExpToTypeScript(r.type1)}, 0, true) 
                        + "' should be equal to (the type of) '" + this.myUnparser.unparse(${langExpToTypeScript(r.type2)}, 0, true) + "'",
                         ${langExpToTypeScript(r.type1)}, 
                         ${locationdescription}, 
                         ${severity}));
                    }`;
    }

    private makeIsuniqueRule(rule: IsuniqueRule, locationdescription: string, severity: string): string {
        const listpropertyName = rule.listproperty.appliedfeature.toPiString();
        const listName = rule.list.appliedfeature.toPiString();
        const uniquelistName = `unique${Names.startWithUpperCase(listpropertyName)}In${Names.startWithUpperCase(listName)}`;
        const referredListproperty = rule.listproperty.findRefOfLastAppliedFeature();
        const listpropertyTypeName = (referredListproperty instanceof PiPrimitiveProperty) ?
                referredListproperty.primType
            :
                referredListproperty.type.referred.name;
        const listpropertyTypescript = langExpToTypeScript(rule.listproperty.appliedfeature);
        return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${langExpToTypeScript(rule.list)}.forEach((elem, index) => {
            if ((elem === undefined) || (elem === null)) {
                this.errorList.push(new PiError(\`Element[\$\{index\}] of property '${listName}' has no value\`,
                 ${langExpToTypeScript(rule.list)}[index],
                 ${locationdescription},
                 ${severity}));
            } else {
                if (!${uniquelistName}.includes(elem.${listpropertyTypescript})){
                    ${uniquelistName}.push(elem.${listpropertyTypescript});
                } else {
                    this.errorList.push(new PiError("The value of property '${listpropertyName}' is not unique in list '${listName}'",
                     ${langExpToTypeScript(rule.list)}[index],
                     ${locationdescription},
                     ${severity}));                }
            }
        });`;
    }

    private makeMessage(message: ValidationMessage): string {
        let result = "";
        // TODO use the expressions to create a better message
        if (!!message) {
            console.log("FOUND message: " + message.value);
            result += `"${message.value}"`;
        }
        return result;
    }
}
