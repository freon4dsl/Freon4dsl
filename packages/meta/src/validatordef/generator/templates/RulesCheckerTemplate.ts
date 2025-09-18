// Note that the following import cannot be from "@freon4dsl/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@freon4dsl/core";
import { GenerationUtil, Imports, Names } from '../../../utils/on-lang/index.js';
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLanguage, FreMetaPrimitiveType,
    FreMetaProperty,
    LangUtil,
    MetaElementReference
} from '../../../languagedef/metalanguage/index.js';
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ClassifierRuleSet,
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
import { ExpressionGenerationUtil } from '../../../langexpressions/generator/ExpressionGenerationUtil.js';
import { FreVarExp } from '../../../langexpressions/metalanguage/index.js';
import { isNullOrUndefined } from '../../../utils/file-utils/index.js';

const paramName: string = "node";

export class RulesCheckerTemplate {
    needIsValidNameMethod: boolean = false;
    
    isValidNameMethod: string = `/**
         * Returns true if 'name' is a valid identifier
         * @param name
         */
        private isValidName(name: string): boolean {
            if (isNullOrUndefined(name)) return false;
            // cannot start with number
            if (/[0-9]/.test( name[0]) ) return false;
            // may contain letters, numbers, '$', and '_', but no other characters
            if (/[.|,!?@~%^&*|-|=+(){}"':;<>]/.test( name ) ) return false;
            if (/\\\\/.test(name)) return false;
            // may not contain whitespaces
            if (/[\\t\\n\\r ]/.test(name)) return false;
            // may not be a Typescript keyword
            return !reservedWordsInTypescript.includes(name);
        }`;

    generateRulesChecker(language: FreMetaLanguage, validdef: ValidatorDef, relativePath: string): string {
        this.distributeInheritedRules(validdef);
        this.removeInterfaceSets(validdef);
        const checkerClassName: string = Names.rulesChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreError, Names.FreErrorSeverity, Names.FreCompositeTyper, Names.FreWriter, Names.FreLanguageEnvironment
        ])
        imports.utils.add(Names.defaultWorker(language))
        const commentBefore: string = `/**
                                * Checks '${paramName}' before checking its children.
                                * Found errors are pushed onto 'errorList'.
                                * @param ${paramName}
                                */`;

        // the template starts here, but most imports are added later, because they are determined during the creation of the output.
        const outputStr: string = `    
        import { type ${checkerInterfaceName} } from "./${Names.validator(language)}.js";   

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

        ${validdef.classifierRules
            .map(
                (ruleSet) =>
                    `${commentBefore}
            public execBefore${Names.classifier(ruleSet.classifier)}(${paramName}: ${Names.classifier(ruleSet.classifier)}): boolean {
                let hasFatalError: boolean = false;
                ${this.createRules(ruleSet, imports)}
                return hasFatalError;
            }`,
            )
            .join("\n\n")}

        ${this.needIsValidNameMethod ? this.isValidNameMethod : ``}
        }`;

        if (this.needIsValidNameMethod) {
            imports.core.add('isNullOrUndefined');
        }
        return `
        // TEMPLATE: RulesCheckerTemplate.generateRulesChecker(...)
        ${imports.makeImports(language)}
        ${this.needIsValidNameMethod ? `import { reservedWordsInTypescript } from "./ReservedWords.js";` : ``}     
        ${outputStr}
        `
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
        const newConceptRules: ClassifierRuleSet[] = [];
        validdef.classifierRules.forEach(rule => {
            const ruleClassifier: FreMetaClassifier | undefined = rule.classifier;
            if (!!ruleClassifier) {
                const implementors: FreMetaClassifier[] = LangUtil.findAllImplementorsAndSubs(ruleClassifier);
                implementors.forEach(implementor => {
                    if (implementor !== ruleClassifier && implementor instanceof FreMetaConcept) {
                        // see if there is a ClassifierRuleSet for the implementor
                        let implementorRule: ClassifierRuleSet | undefined = validdef.classifierRules.find(rule2 =>
                          rule2.classifier === implementor
                        );
                        if (implementorRule === undefined) {
                            // create new conceptRule
                            implementorRule = new ClassifierRuleSet();
                            implementorRule.classifierRef = MetaElementReference.create<FreMetaConcept>(implementor);
                            newConceptRules.push(implementorRule);
                        }
                        implementorRule.rules.push(...rule.rules);
                    }
                });
            }
        });
        validdef.classifierRules.push(...newConceptRules);
    }

    /**
     * This method removes all rule sets that are defined for interfaces, because they are not
     * present in the model, only the concepts that implement them are.
     *
     * @param validdef
     * @private
     */
    private removeInterfaceSets(validdef: ValidatorDef) {
        validdef.classifierRules = validdef.classifierRules.filter(rule => !(rule.classifier instanceof FreMetaInterface));
    }

    private createRules(ruleSet: ClassifierRuleSet, imports: Imports): string {
        let result: string = "";
        // find the string that indicates the location in human terms
        const locationdescription: string = ValidationUtils.findLocationDescription(ruleSet.classifier, paramName);

        // add import to the classifier of this set
        imports.language.add(ruleSet.classifier!.name);

        // add all rules for this classifier
        ruleSet.rules.forEach((r, index) => {
            // find the severity for the rule
            const severity: string = this.makeSeverity(r);

            // if this rule has a message defined by the language engineer then use it
            const message: string | undefined = !!r.message ? this.makeMessage(r.message, imports) : undefined;

            // add a comment to the result
            result += `\n// ${r.toFreString()}\n`;

            // create the text for the rule
            if (r instanceof CheckEqualsTypeRule) {
                result += this.makeEqualsTypeRule(r, locationdescription, severity, index, imports, message);
            } else if (r instanceof CheckConformsRule) {
                result += this.makeConformsRule(r, locationdescription, severity, imports, message);
            } else if (r instanceof NotEmptyRule) {
                result += this.makeNotEmptyRule(r, locationdescription, severity, imports, message);
            } else if (r instanceof ValidNameRule) {
                this.needIsValidNameMethod = true;
                result += this.makeValidNameRule(r, locationdescription, severity, imports, message);
            } else if (r instanceof ExpressionRule) {
                result += this.makeExpressionRule(r, locationdescription, severity, imports, message);
            } else if (r instanceof IsUniqueRule) {
                result += this.makeIsuniqueRule(r, locationdescription, severity, imports, message);
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

    private makeExpressionRule(r: ExpressionRule, locationdescription: string, severity: string, imports: Imports, message?: string) {
        if (!message || message.length === 0) {
            message = `"'${r.toFreString()}' is false"`;
        }
        if (!!r.exp1 && !!r.exp2) {
            return `if (!(${ExpressionGenerationUtil.langExpToTypeScript(r.exp1, paramName, imports)} ${ValidationUtils.freComparatorToTypeScript(r.comparator)} ${ExpressionGenerationUtil.langExpToTypeScript(r.exp2, paramName, imports)})) {
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
        imports: Imports,
        message?: string,
    ): string {
        if (!!r.property) {
            if (!message || message.length === 0) {
                message = `"'" + ${ExpressionGenerationUtil.langExpToTypeScript(r.property, paramName, imports)} + "' is not a valid identifier"`;
            }
            return `if (!this.isValidName(${ExpressionGenerationUtil.langExpToTypeScript(r.property, paramName, imports)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, ${paramName}, ${locationdescription}, ${severity} ));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                }`;
        } else {
            return "<error in makeValidNameRule>";
        }
    }

    private makeNotEmptyRule(r: NotEmptyRule, locationdescription: string, severity: string, imports: Imports, message?: string): string {
        if (!!r.property) {
            if (!message || message.length === 0) {
                message = `"List '${r.property.toFreString()}' may not be empty"`;
            }
            return `if (${ExpressionGenerationUtil.langExpToTypeScript(r.property, paramName, imports)}.length === 0) {
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
        imports: Imports,
        message?: string,
    ): string {
        if (!!r.type1Exp && !!r.type2Exp) {
            if (!message || message.length === 0) {
                message = `"Type " + this.typer.inferType(${ExpressionGenerationUtil.langExpToTypeScript(r.type1Exp, paramName, imports)})?.toFreString(this.myWriter) + " of [" + this.myWriter.writeNameOnly(${ExpressionGenerationUtil.langExpToTypeScript(r.type1Exp, paramName, imports)}) +
                         "] does not conform to " + this.myWriter.writeNameOnly(${ExpressionGenerationUtil.langExpToTypeScript(r.type2Exp, paramName, imports)})`;
            }
            return `if (!this.typer.conformsType(${ExpressionGenerationUtil.langExpToTypeScript(r.type1Exp, paramName, imports)}, ${ExpressionGenerationUtil.langExpToTypeScript(r.type2Exp, paramName, imports)})) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${ExpressionGenerationUtil.langExpToTypeScript(r.type1Exp, paramName, imports)}, ${locationdescription}, ${severity}));
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
        imports: Imports,
        message?: string,
    ): string {
        // TODO change other methods similar to this one, i.e. first determine the types then call typer on types
        // TODO make sure alle errors message use the same format
        if (!!r.type1Exp && !!r.type2Exp) {
            let leftElement: string = ExpressionGenerationUtil.langExpToTypeScript(r.type1Exp, paramName, imports);
            let rightElement: string = ExpressionGenerationUtil.langExpToTypeScript(r.type2Exp, paramName, imports);

            if (!message || message.length === 0) {
                message = `"Type of "+ this.myWriter.writeNameOnly(${leftElement})
                        + " (" + leftType${index}?.toFreString(this.myWriter) + ") should equal the type of "
                        + this.myWriter.writeNameOnly(${rightElement})
                        + " (" + rightType${index}?.toFreString(this.myWriter) + ")"`;
            }
            imports.core.add('notNullOrUndefined');
            return `const leftType${index} = this.typer.inferType(${leftElement});
            const rightType${index} = this.typer.inferType(${rightElement});
            if (notNullOrUndefined(leftType0) && notNullOrUndefined(rightType0)) {
                if (!this.typer.equals(leftType${index}, rightType${index})) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${leftElement}, ${locationdescription}, ${severity}));
                    ${r.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
                }
            }`;
        } else {
            return "<error in makeEqualsTypeRule>";
        }
    }

    private makeIsuniqueRule(
        rule: IsUniqueRule,
        locationdescription: string,
        severity: string,
        imports: Imports,
        message?: string,
    ): string {
        if (!!rule.listpropertyExp && !!rule.listExp) {
            // find the objects that the expressions refer to
            const lastPropExp = rule.listpropertyExp.getLastExpression();
            const lastListExp = rule.listExp.getLastExpression();
            if (!(lastPropExp instanceof FreVarExp) || !(lastListExp instanceof FreVarExp)) { // should be the case, checked by the checker!
                return '';
            }

            // create the name of the variable that will hold the properties that need be unique
            const listpropertyName: string = lastPropExp.name;
            const listName: string = lastListExp.name;
            const uniquelistName: string = `unique${Names.startWithUpperCase(listpropertyName)}In${Names.startWithUpperCase(listName)}`;

            // generate code for the type of the list, and the list property expression
            const referredListproperty: FreMetaProperty | undefined = lastPropExp.referredProperty;
            let listpropertyTypeName: string = "";
            let listpropertyTypescript: string = "";
            if (!isNullOrUndefined(referredListproperty)) {
                listpropertyTypeName = GenerationUtil.getBaseTypeAsString(referredListproperty);
                listpropertyTypescript = ExpressionGenerationUtil.langExpToTypeScript(rule.listpropertyExp, 'elem', imports);
            }

            // determine the type of the list elements
            const referredList: FreMetaProperty | undefined = lastListExp.referredProperty;
            let listElementTypeName: string = "";
            if (!isNullOrUndefined(referredList)) {
                listElementTypeName = GenerationUtil.getBaseTypeAsString(referredList);
            }

            // determine how the name of an erroneous element will be exposed, based on whether the list elements are references or not
            let refAddition: string = "";
            let howToWriteName: string = `this.myWriter.writeNameOnly(elem)`;
            if (!!rule.listExp.getLastExpression() && !rule.listExp.getIsPart()) {
                // the elements in the list are all FreNodeReferences
                refAddition += ".referred";
                howToWriteName = `elem.name`; // if the list element is a reference there is no need to call the writer
            }

            // create an error message
            if (!message || message.length === 0) {
                message = `\`The value of property '${listpropertyName}' (\"\${${howToWriteName}}\") is not unique in list '${listName}'\``;
            }

            // add imports
            imports.core.add('isNullOrUndefined').add('notNullOrUndefined');
            // ... but do not add the primitive types
            if (listpropertyTypeName !== 'number' && listpropertyTypeName !== 'string' && listpropertyTypeName !== 'boolean') {
                imports.language.add(listpropertyTypeName);
            }
            if (listElementTypeName !== 'number' && listElementTypeName !== 'string' && listElementTypeName !== 'boolean') {
                imports.language.add(listElementTypeName);
            }

            // return the template string
            return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${ExpressionGenerationUtil.langExpToTypeScript(rule.listExp, paramName, imports)}.forEach((elem: ${listElementTypeName}, index: number) => {
            if (isNullOrUndefined(elem)) {
                this.errorList.push(new ${Names.FreError}(\`Element[\$\{index\}] of property '${listName}' has no value\`,
                 ${ExpressionGenerationUtil.langExpToTypeScript(rule.listExp, paramName, imports)}[index]${refAddition},
                 ${locationdescription},
                 "${listpropertyName}",
                 ${severity}));
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
            } else {
                if (notNullOrUndefined(${listpropertyTypescript}) && !${uniquelistName}.includes(${listpropertyTypescript})){
                    ${uniquelistName}.push(${listpropertyTypescript});
                } else {
                    this.errorList.push(new ${Names.FreError}(${message},
                     ${ExpressionGenerationUtil.langExpToTypeScript(rule.listExp, paramName, imports)}[index]${refAddition},
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

    private makeMessage(message: ValidationMessage, imports: Imports): string {
        let result: string = "";
        if (!!message) {
            const numberOfparts = message.content.length;
            message.content.forEach((cont, index) => {
                if (cont instanceof ValidationMessageText) {
                    // console.log("FOUND message text: '" + cont.value + "'");
                    result += `${cont.value}`;
                } else if (!!cont.expression) {
                    if (cont.expression.getResultingClassifier() instanceof FreMetaPrimitiveType) {
                        result += `\${${ExpressionGenerationUtil.langExpToTypeScript(cont.expression, paramName, imports)}}`;
                    } else {
                        // console.log("FOUND message expression: '" + cont.expression.toFreString() + "'");
                        result += `\${this.myWriter.writeToString(${ExpressionGenerationUtil.langExpToTypeScript(cont.expression, paramName, imports)})}`;
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
