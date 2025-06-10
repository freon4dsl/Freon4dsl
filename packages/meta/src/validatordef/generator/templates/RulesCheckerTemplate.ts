// Note that the following import cannot be from "@freon4dsl/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@freon4dsl/core";
import { GenerationUtil, Imports, Names } from '../../../utils/on-lang/index.js';
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaPrimitiveProperty,
    FreMetaProperty, LangUtil,
    MetaElementReference
} from '../../../languagedef/metalanguage/index.js';
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsUniqueRule,
    NotEmptyRule,
    ValidationMessage,
    ValidationMessageText,
    ValidationRule,
    ValidatorDef,
    ValidNameRule
} from '../../metalanguage/index.js';
import { ValidationUtils } from '../ValidationUtils.js';
import { FreErrorSeverity } from '../../../utils/no-dependencies/index.js';
import { ExpressionUtil } from '../../../utils/on-old-expressions/ExpressionUtil.js';

const paramName: string = "node";

export class RulesCheckerTemplate {

    generateRulesChecker(language: FreMetaLanguage, validdef: ValidatorDef, relativePath: string): string {
        this.distributeInheritedRules(validdef);
        this.removeInterfaceSets(validdef);
        const checkerClassName: string = Names.rulesChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreError, Names.FreErrorSeverity, Names.FreCompositeTyper, Names.FreWriter, Names.FreNamedNode, Names.FreLanguageEnvironment
        ])
        imports.language = GenerationUtil.allConceptsInterfacesAndUnits(language)
        imports.utils.add(Names.defaultWorker(language))
        const commentBefore: string = `/**
                                * Checks '${paramName}' before checking its children.
                                * Found errors are pushed onto 'errorList'.
                                * @param ${paramName}
                                */`;
        // the template starts here
        return `
        // TEMPLATE: RulesCheckerTemplate.generateRulesChecker(...)
        ${imports.makeImports(language)}
        import { type ${checkerInterfaceName} } from "./${Names.validator(language)}.js";
        import { reservedWordsInTypescript } from "./ReservedWords.js";

        /**
         * Class ${checkerClassName} is the part of validator that is generated from, if present,
         * the validator definition. As the other checkers, it uses the visitor pattern.
         * Class ${Names.defaultWorker(language)} implements the traversal of the model tree. This class implements
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${Names.defaultWorker(language)} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${Names.FreWriter} = ${Names.FreLanguageEnvironment}.getInstance().writer;
            // 'typer' is used to implement the 'typecheck' rules in the validator definition
            typer: ${Names.FreCompositeTyper} = ${Names.FreLanguageEnvironment}.getInstance().typer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${Names.FreError}[] = [];

        ${validdef.conceptRules
            .map(
                (ruleSet) =>
                    `${commentBefore}
            public execBefore${Names.classifier(ruleSet.conceptRef?.referred)}(${paramName}: ${Names.classifier(ruleSet.conceptRef?.referred)}): boolean {
                let hasFatalError: boolean = false;
                ${this.createRules(ruleSet)}
                return hasFatalError;
            }`,
            )
            .join("\n\n")}

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
            return !reservedWordsInTypescript.includes(name);
            }
        }
        `;
    }

    /**
     * This method takes all validation rules for super concepts and interfaces and
     * copies them to every concept that implements or inherits from them.
     *
     * @param validdef
     * @private
     */
    private distributeInheritedRules(validdef: ValidatorDef) {
        // add rules of super types to each concept
        const newConceptRules: ConceptRuleSet[] = [];
        validdef.conceptRules.forEach(rule => {
            const ruleClassifier: FreMetaClassifier | undefined = rule.conceptRef?.referred;
            if (!!ruleClassifier) {
                const implementors: FreMetaClassifier[] = LangUtil.findAllImplementorsAndSubs(ruleClassifier);
                implementors.forEach(implementor => {
                    if (implementor !== ruleClassifier && implementor instanceof FreMetaConcept) {
                        // see if there is a ConceptRuleSet for the implementor
                        let implementorRule: ConceptRuleSet | undefined = validdef.conceptRules.find(rule2 =>
                          rule2.conceptRef?.referred === implementor
                        );
                        if (implementorRule === undefined) {
                            // create new conceptRule
                            implementorRule = new ConceptRuleSet();
                            implementorRule.conceptRef = MetaElementReference.create<FreMetaConcept>(implementor, 'FreMetaConcept');
                            newConceptRules.push(implementorRule);
                        }
                        implementorRule.rules.push(...rule.rules);
                    }
                });
            }
        });
        validdef.conceptRules.push(...newConceptRules);
    }

    /**
     * This method removes all rule sets that are defined for interfaces, because they are not
     * present in the model, only the concepts that implement them are.
     *
     * @param validdef
     * @private
     */
    private removeInterfaceSets(validdef: ValidatorDef) {
        validdef.conceptRules = validdef.conceptRules.filter(rule => !(rule.conceptRef?.referred instanceof FreMetaInterface));
    }

    private createRules(ruleSet: ConceptRuleSet): string {
        let result: string = "";
        // find the property that indicates the location in human terms
        const locationdescription: string = ValidationUtils.findLocationDescription(ruleSet.conceptRef?.referred, paramName);

        ruleSet.rules.forEach((r, index) => {
            // find the severity for the rule
            const severity: string = this.makeSeverity(r);

            // if this rule has a message defined by the language engineer then use it
            const message: string | undefined = !!r.message ? this.makeMessage(r.message) : undefined;

            // add a comment to the result
            result += `// ${r.toFreString()}\n`;

            // create the text for the rule
            if (r instanceof CheckEqualsTypeRule) {
                result += this.makeEqualsTypeRule(r, locationdescription, severity, index, message);
            } else if (r instanceof CheckConformsRule) {
                result += this.makeConformsRule(r, locationdescription, severity, message);
            } else if (r instanceof NotEmptyRule) {
                result += this.makeNotEmptyRule(r, locationdescription, severity, message);
            } else if (r instanceof ValidNameRule) {
                result += this.makeValidNameRule(r, locationdescription, severity, message);
            } else if (r instanceof ExpressionRule) {
                result += this.makeExpressionRule(r, locationdescription, severity, message);
            } else if (r instanceof IsUniqueRule) {
                result += this.makeIsuniqueRule(r, locationdescription, severity, message);
            }
        });
        return result;
    }

    private makeSeverity(r: ValidationRule): string {
        // this method makes sure that we do not depend on the name of the severity to be the same as its value
        // e.g. FreErrorSeverity.NONE = "none",
        let result: string = `${Names.FreErrorSeverity}.`;

        switch (r.severity.severity) {
            case FreErrorSeverity.Error: {
                result += `Error`;
                break;
            }
            case FreErrorSeverity.Warning: {
                result += `Warning`;
                break;
            }
            case FreErrorSeverity.Hint: {
                result += `Hint`;
                break;
            }
            case FreErrorSeverity.Improvement: {
                result += `Improvement`;
                break;
            }
            case FreErrorSeverity.ToDo: {
                result += `ToDo`;
                break;
            }
            case FreErrorSeverity.Info: {
                result += `Info`;
                break;
            }
            case FreErrorSeverity.NONE: {
                result += `NONE`;
                break;
            }
            default: {
                result += `ToDo`;
            }
        }
        return result;
    }

    private makeExpressionRule(r: ExpressionRule, locationdescription: string, severity: string, message?: string) {
        if (!message || message.length === 0) {
            message = `"'${r.toFreString()}' is false"`;
        }
        if (!!r.exp1 && !!r.exp2) {
            return `if (!(${ExpressionUtil.langExpToTypeScript(r.exp1, paramName)} ${ValidationUtils.freComparatorToTypeScript(r.comparator)} ${ExpressionUtil.langExpToTypeScript(r.exp2, paramName)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, ${paramName}, ${locationdescription}, ${severity} ));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                }`;
        } else {
            return "<error in makeExpressionRule>";
        }
    }

    private makeValidNameRule(
        r: ValidNameRule,
        locationdescription: string,
        severity: string,
        message?: string,
    ): string {
        if (!!r.property) {
            if (!message || message.length === 0) {
                message = `"'" + ${ExpressionUtil.langExpToTypeScript(r.property, paramName)} + "' is not a valid identifier"`;
            }
            return `if (!this.isValidName(${ExpressionUtil.langExpToTypeScript(r.property, paramName)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, ${paramName}, ${locationdescription}, ${severity} ));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                }`;
        } else {
            return "<error in makeValidNameRule>";
        }
    }

    private makeNotEmptyRule(r: NotEmptyRule, locationdescription: string, severity: string, message?: string): string {
        if (!!r.property) {
            if (!message || message.length === 0) {
                message = `"List '${r.property.toFreString()}' may not be empty"`;
            }
            return `if (${ExpressionUtil.langExpToTypeScript(r.property, paramName)}.length === 0) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${paramName}, ${locationdescription}, "${r.property.toFreString()}", ${severity}));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                }`;
        } else {
            return "<error in makeNotEmptyRule>";
        }
    }

    private makeConformsRule(
        r: CheckConformsRule,
        locationdescription: string,
        severity: string,
        message?: string,
    ): string {
        if (!!r.type1 && !!r.type2) {
            if (!message || message.length === 0) {
                message = `"Type " + this.typer.inferType(${ExpressionUtil.langExpToTypeScript(r.type1, paramName)})?.toFreString(this.myWriter) + " of [" + this.myWriter.writeNameOnly(${ExpressionUtil.langExpToTypeScript(r.type1, paramName)}) +
                         "] does not conform to " + this.myWriter.writeNameOnly(${ExpressionUtil.langExpToTypeScript(r.type2, paramName)})`;
            }
            return `if (!this.typer.conformsType(${ExpressionUtil.langExpToTypeScript(r.type1, paramName)}, ${ExpressionUtil.langExpToTypeScript(r.type2, paramName)})) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${ExpressionUtil.langExpToTypeScript(r.type1, paramName)}, ${locationdescription}, ${severity}));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                 }`;
        } else {
            return "<error in makeConformsRule>";
        }
    }

    private makeEqualsTypeRule(
        r: CheckEqualsTypeRule,
        locationdescription: string,
        severity: string,
        index: number,
        message?: string,
    ): string {
        // TODO change other methods similar to this one, i.e. first determine the types then call typer on types
        // TODO make sure alle errors message use the same format
        if (!!r.type1 && !!r.type2) {
            const leftElement: string = ExpressionUtil.langExpToTypeScript(r.type1, paramName);
            const rightElement: string = ExpressionUtil.langExpToTypeScript(r.type2, paramName);
            if (!message || message.length === 0) {
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
        } else {
            return "<error in makeEqualsTypeRule>";
        }
    }

    private makeIsuniqueRule(
        rule: IsUniqueRule,
        locationdescription: string,
        severity: string,
        message?: string,
    ): string {
        if (!!rule.listproperty && !!rule.list) {
            const listpropertyName: string = rule.listproperty.appliedfeature.toFreString();
            const listName: string = rule.list.appliedfeature.toFreString();
            const uniquelistName: string = `unique${Names.startWithUpperCase(listpropertyName)}In${Names.startWithUpperCase(listName)}`;
            const referredListproperty: FreMetaProperty | undefined = rule.listproperty.findRefOfLastAppliedFeature();
            let listpropertyTypeName: string = "";
            let listpropertyTypescript: string = "";
            if (!!referredListproperty) {
                listpropertyTypeName = GenerationUtil.getBaseTypeAsString(referredListproperty);
                listpropertyTypescript = ExpressionUtil.langExpToTypeScript(rule.listproperty.appliedfeature, paramName);
            }
            //
            let refAddition: string = "";
            let howToWriteName: string = "this.myWriter.writeNameOnly(elem)";
            if (!!rule.list.findRefOfLastAppliedFeature() && !rule.list.findRefOfLastAppliedFeature()!.isPart) {
                // the elements in the list are all FreNodeReferences
                refAddition += ".referred";
                howToWriteName = "elem.name"; // if the list element is a reference there is no need to call the writer
            }
            //
            if (!message || message.length === 0) {
                message = `\`The value of property '${listpropertyName}' (\"\${${howToWriteName}}\") is not unique in list '${listName}'\``;
            }
            return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${ExpressionUtil.langExpToTypeScript(rule.list, paramName)}.forEach((elem, index) => {
            if ((elem === undefined) || (elem === null)) {
                this.errorList.push(new ${Names.FreError}(\`Element[\$\{index\}] of property '${listName}' has no value\`,
                 ${ExpressionUtil.langExpToTypeScript(rule.list, paramName)}[index]${refAddition},
                 ${locationdescription},
                 "${listpropertyName}",
                 ${severity}));
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
            } else {
                if (!${uniquelistName}.includes(elem.${listpropertyTypescript})){
                    ${uniquelistName}.push(elem.${listpropertyTypescript});
                } else {
                    this.errorList.push(new ${Names.FreError}(${message},
                     ${ExpressionUtil.langExpToTypeScript(rule.list, paramName)}[index]${refAddition},
                     ${locationdescription},
                     "${listpropertyName}",
                     ${severity}));                }
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
            }
        });`;
        } else {
            return "<error in makeIsuniqueRule>";
        }
    }

    private makeMessage(message: ValidationMessage): string {
        let result: string = "";
        if (!!message) {
            const numberOfparts = message.content.length;
            message.content.forEach((cont, index) => {
                if (cont instanceof ValidationMessageText) {
                    // console.log("FOUND message text: '" + cont.value + "'");
                    result += `${cont.value}`;
                } else if (!!cont.expression) {
                    if (cont.expression.findRefOfLastAppliedFeature() instanceof FreMetaPrimitiveProperty) {
                        result += `\${${ExpressionUtil.langExpToTypeScript(cont.expression, paramName)}}`;
                    } else {
                        // console.log("FOUND message expression: '" + cont.expression.toFreString() + "'");
                        result += `\${this.myWriter.writeToString(${ExpressionUtil.langExpToTypeScript(cont.expression, paramName)})}`;
                    }
                }
                if (index < numberOfparts - 1) {
                    result += " ";
                }
            });
        }
        if (result.length > 0) {
            result = "`" + result + "`";
        }
        return result;
    }

}
