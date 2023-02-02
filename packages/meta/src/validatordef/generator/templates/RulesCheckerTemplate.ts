// Note that the following import cannot be from "@projectit/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@projectit/core";
import {
    GenerationUtil,
    LANGUAGE_GEN_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    FreErrorSeverity,
    PROJECTITCORE
} from "../../../utils";
import { FreLanguage, FrePrimitiveProperty } from "../../../languagedef/metalanguage";
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsuniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationMessageText,
    ValidationRule,
    ValidNameRule
} from "../../metalanguage";
import { ValidationUtils } from "../ValidationUtils";

export class RulesCheckerTemplate {

    generateRulesChecker(language: FreLanguage, validdef: ValidatorDef, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const checkerClassName: string = Names.rulesChecker(language);
        const typerInterfaceName: string = Names.FreTyper;
        const writerInterfaceName: string = Names.FreWriter;
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const commentBefore = `/**
                                * Checks 'modelelement' before checking its children.
                                * Found errors are pushed onto 'errorlist'.
                                * @param modelelement
                                */`;
        // the template starts here
        return `
        import { ${errorClassName}, ${Names.FreErrorSeverity}, ${typerInterfaceName}, ${writerInterfaceName}, ${Names.FreNamedNode}, ${Names.LanguageEnvironment} } from "${PROJECTITCORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";   
        import { ${checkerInterfaceName} } from "./${Names.validator(language)}";
        import { reservedWordsInTypescript } from "./ReservedWords";         

        /**
         * Class ${checkerClassName} is the part of validator that is generated from, if present, 
         * the validator definition. As the other checkers, it uses the visitor pattern. 
         * Class ${defaultWorkerName} implements the traversal of the model tree. This class implements 
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = ${Names.LanguageEnvironment}.getInstance().writer;
            // 'typer' is used to implement the 'typecheck' rules in the validator definition 
            typer: ${typerInterfaceName} = ${Names.LanguageEnvironment}.getInstance().typer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${validdef.conceptRules.map(ruleSet =>
            `${commentBefore}
            public execBefore${Names.concept(ruleSet.conceptRef.referred)}(modelelement: ${Names.concept(ruleSet.conceptRef.referred)}): boolean {
                let hasFatalError: boolean = false;
                ${this.createRules(ruleSet)}
                return hasFatalError;
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

    private createImports(language: FreLanguage): string {
        return `${language.concepts?.map(concept => `
                ${Names.concept(concept)}`).concat(
                    language.interfaces?.map(intf => `
                ${Names.interface(intf)}`).concat(
                        language.units?.map(intf => `
                ${Names.classifier(intf)}`).join(", ")))
            }`;
    }

    private createRules(ruleSet: ConceptRuleSet): string {
        let result: string = "";
        // find the property that indicates the location in human terms
        const locationdescription = ValidationUtils.findLocationDescription(ruleSet.conceptRef.referred);

        ruleSet.rules.forEach((r, index) => {
            // find the severity for the rule
            const severity: string = this.makeSeverity(r);

            // if this rule has a message defined by the language engineer then use it
            const message: string = this.makeMessage(r.message);

            // add a comment to the result
            result += `// ${r.toFreString()}\n`;

            // create the text for the rule
            if (r instanceof CheckEqualsTypeRule) {
                result += this.makeEqualsTypeRule(r, locationdescription, severity, index, message);
            } else if (r instanceof CheckConformsRule) {
                result += this.makeConformsRule(r, locationdescription, severity, message);
            } else if (r instanceof NotEmptyRule) {
                result += this.makeNotEmptyRule(r, locationdescription, severity, message)
            } else if (r instanceof ValidNameRule) {
                result += this.makeValidNameRule(r, locationdescription, severity, message)
            } else if (r instanceof ExpressionRule) {
                result += this.makeExpressionRule(r, locationdescription, severity, message)
            } else if (r instanceof IsuniqueRule) {
                result += this.makeIsuniqueRule(r, locationdescription, severity, message);
            }
        });
        return result;
    }

    private makeSeverity(r: ValidationRule): string {
        // this method makes sure that we do not depend on the name of the severity to be the same as its value
        // e.g. FreErrorSeverity.NONE = "none",
        let result: string = `${Names.FreErrorSeverity}.`
        switch (r.severity.severity) {
            case FreErrorSeverity.Error: {
                result += `Error`;
                break;
            }
            case FreErrorSeverity.Improvement:{
                result += `Improvement`;
                break;
            }
            case FreErrorSeverity.Info:{
                result += `Info`;
                break;
            }
            case FreErrorSeverity.NONE:{
                result += `NONE`;
                break;
            }
            case FreErrorSeverity.ToDo:{
                result += `ToDo`;
                break;
            }
        }
        return result;
    }

    private makeExpressionRule(r: ExpressionRule, locationdescription: string, severity: string, message: string) {
        if (message.length === 0) {
            message = `"'${r.toFreString()}' is false"`;
        }
        return `if (!(${GenerationUtil.langExpToTypeScript(r.exp1)} ${r.comparator} ${GenerationUtil.langExpToTypeScript(r.exp2)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, modelelement, ${locationdescription}, ${severity} ));   
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
                }`;
    }

    private makeValidNameRule(r: ValidNameRule, locationdescription: string, severity: string, message: string) {
        if (message.length === 0) {
            message = `"'" + ${GenerationUtil.langExpToTypeScript(r.property)} + "' is not a valid identifier"`;
        }
        return `if (!this.isValidName(${GenerationUtil.langExpToTypeScript(r.property)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, modelelement, ${locationdescription}, ${severity} ));                         
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
                }`;
    }

    private makeNotEmptyRule(r: NotEmptyRule, locationdescription: string, severity: string, message: string) {
        if (message.length === 0) {
            message = `"List '${r.property.toFreString()}' may not be empty"`;
        }
        return `if (${GenerationUtil.langExpToTypeScript(r.property)}.length == 0) {
                    this.errorList.push(new ${Names.FreError}(${message}, modelelement, ${locationdescription}, "${r.property.toFreString()}", ${severity}));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
                }`;
    }

    private makeConformsRule(r: CheckConformsRule, locationdescription: string, severity: string, message?: string) {
        if (message.length === 0) {
            message = `"Type " + this.typer.inferType(${GenerationUtil.langExpToTypeScript(r.type1)})?.toFreString(this.myWriter) + " of [" + this.myWriter.writeNameOnly(${GenerationUtil.langExpToTypeScript(r.type1)}) + 
                         "] does not conform to " + this.myWriter.writeNameOnly(${GenerationUtil.langExpToTypeScript(r.type2)})`;
        }
        return `if (!this.typer.conformsType(${GenerationUtil.langExpToTypeScript(r.type1)}, ${GenerationUtil.langExpToTypeScript(r.type2)})) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${GenerationUtil.langExpToTypeScript(r.type1)}, ${locationdescription}, ${severity}));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
                 }`;
    }

    private makeEqualsTypeRule(r: CheckEqualsTypeRule, locationdescription: string, severity: string, index: number, message?: string) {
        // TODO change other methods similar to this one, i.e. first determine the types then call typer on types
        // TODO make sure alle errors message use the same format
        const leftElement: string = GenerationUtil.langExpToTypeScript(r.type1);
        const rightElement: string = GenerationUtil.langExpToTypeScript(r.type2);
        if (message.length === 0) {
            message = `"Type of '"+ this.myWriter.writeNameOnly(${leftElement}) 
                        + "' (" + leftType${index}?.toFreString(this.myWriter) + ") should equal the type of '" 
                        + this.myWriter.writeNameOnly(${rightElement})
                        + "' (" + rightType${index}?.toFreString(this.myWriter) + ")"`;
        }
        return `const leftType${index} = this.typer.inferType(${leftElement});
            const rightType${index} = this.typer.inferType(${rightElement});
            if (!this.typer.equals(leftType${index}, rightType${index})) {
                this.errorList.push(new ${Names.FreError}(${message}, ${leftElement}, ${locationdescription}, ${severity}));
                ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
            }`;
    }

    private makeIsuniqueRule(rule: IsuniqueRule, locationdescription: string, severity: string, message: string): string {
        const listpropertyName = rule.listproperty.appliedfeature.toFreString();
        const listName = rule.list.appliedfeature.toFreString();
        const uniquelistName = `unique${Names.startWithUpperCase(listpropertyName)}In${Names.startWithUpperCase(listName)}`;
        const referredListproperty = rule.listproperty.findRefOfLastAppliedFeature();
        const listpropertyTypeName = GenerationUtil.getBaseTypeAsString(referredListproperty);
        const listpropertyTypescript = GenerationUtil.langExpToTypeScript(rule.listproperty.appliedfeature);
        //
        let refAddition: string = '';
        let howToWriteName: string = 'this.myWriter.writeNameOnly(elem)';
        if (!rule.list.findRefOfLastAppliedFeature().isPart) { // the elements in the list are all FreElementReferences
            refAddition += ".referred";
            howToWriteName = 'elem.name'; // if the list element is a reference there is no need to call the writer
        }
        //
        if (message.length === 0) {
            message = `\`The value of property '${listpropertyName}' (\"\${${howToWriteName}}\") is not unique in list '${listName}'\``;
        }
        return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${GenerationUtil.langExpToTypeScript(rule.list)}.forEach((elem, index) => {
            if ((elem === undefined) || (elem === null)) {
                this.errorList.push(new ${Names.FreError}(\`Element[\$\{index\}] of property '${listName}' has no value\`,
                 ${GenerationUtil.langExpToTypeScript(rule.list)}[index]${refAddition},
                 ${locationdescription},
                 "${listpropertyName}",
                 ${severity}));
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
            } else {
                if (!${uniquelistName}.includes(elem.${listpropertyTypescript})){
                    ${uniquelistName}.push(elem.${listpropertyTypescript});
                } else {
                    this.errorList.push(new ${Names.FreError}(${message},
                     ${GenerationUtil.langExpToTypeScript(rule.list)}[index]${refAddition},
                     ${locationdescription},
                     "${listpropertyName}",
                     ${severity}));                }
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}                      
            }
        });`;
    }

    private makeMessage(message: ValidationMessage): string {
        let result = "";
        if (!!message) {
            const numberOfparts = message.content.length;
            message.content.forEach((cont, index) => {
                if (cont instanceof ValidationMessageText) {
                    // console.log("FOUND message text: '" + cont.value + "'");
                    result += `${cont.value}`;
                } else if (cont instanceof ValidationMessageReference) {
                    if (cont.expression.findRefOfLastAppliedFeature() instanceof FrePrimitiveProperty) {
                        result += `\${${GenerationUtil.langExpToTypeScript(cont.expression)}}`;
                    } else {
                        // console.log("FOUND message expression: '" + cont.expression.toFreString() + "'");
                        result += `\${this.myWriter.writeToString(${GenerationUtil.langExpToTypeScript(cont.expression)})}`;
                    }
                }
                if (index < numberOfparts - 1) {
                    result += " ";
                }
            });
        }
        if (result.length > 0) {
            result = "\`" + result + "\`";
        }
        return result;
    }
}
