// Note that the following import cannot be from "@freon4dsl/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@freon4dsl/core";
import {
    GenerationUtil,
    LANGUAGE_GEN_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    FreErrorSeverity,
    FREON_CORE,
} from "../../../utils/index.js";
import { FreMetaLanguage, FreMetaPrimitiveProperty, FreMetaProperty } from "../../../languagedef/metalanguage/index.js";
import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet,
    ExpressionRule,
    IsUniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationMessageText,
    ValidationRule,
    ValidNameRule,
} from "../../metalanguage/index.js";
import { ValidationUtils } from "../ValidationUtils.js";

export class RulesCheckerTemplate {
    paramName: string = "modelElement";

    generateRulesChecker(language: FreMetaLanguage, validdef: ValidatorDef, relativePath: string): string {
        const defaultWorkerName: string = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const checkerClassName: string = Names.rulesChecker(language);
        const typerInterfaceName: string = Names.FreTyper;
        const writerInterfaceName: string = Names.FreWriter;
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const commentBefore: string = `/**
                                * Checks '${this.paramName}' before checking its children.
                                * Found errors are pushed onto 'errorlist'.
                                * @param ${this.paramName}
                                */`;
        // the template starts here
        return `
        import { ${errorClassName}, ${Names.FreErrorSeverity}, ${typerInterfaceName}, ${writerInterfaceName}, ${Names.FreNamedNode}, ${Names.LanguageEnvironment} } from "${FREON_CORE}";
        import { ${this.createImports(language)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}/index.js";
        import { ${defaultWorkerName} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}/index.js";
        import { ${checkerInterfaceName} } from "./${Names.validator(language)}.js";
        import { reservedWordsInTypescript } from "./ReservedWords.js";

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

        ${validdef.conceptRules
            .map(
                (ruleSet) =>
                    `${commentBefore}
            public execBefore${Names.concept(ruleSet.conceptRef?.referred)}(${this.paramName}: ${Names.concept(ruleSet.conceptRef?.referred)}): boolean {
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

    private createImports(language: FreMetaLanguage): string {
        return `${language.concepts
            ?.map(
                (concept) => `
                ${Names.concept(concept)}`,
            )
            .concat(
                language.interfaces
                    ?.map(
                        (intf) => `
                ${Names.interface(intf)}`,
                    )
                    .concat(
                        language.units
                            ?.map(
                                (intf) => `
                ${Names.classifier(intf)}`,
                            )
                            .join(", "),
                    ),
            )}`;
    }

    private createRules(ruleSet: ConceptRuleSet): string {
        let result: string = "";
        // find the property that indicates the location in human terms
        const locationdescription: string = ValidationUtils.findLocationDescription(ruleSet.conceptRef?.referred, this.paramName);

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
            case FreErrorSeverity.Improvement: {
                result += `Improvement`;
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
            case FreErrorSeverity.ToDo: {
                result += `ToDo`;
                break;
            }
        }
        return result;
    }

    private makeExpressionRule(r: ExpressionRule, locationdescription: string, severity: string, message?: string) {
        if (!message || message.length === 0) {
            message = `"'${r.toFreString()}' is false"`;
        }
        if (!!r.exp1 && !!r.exp2) {
            return `if (!(${GenerationUtil.langExpToTypeScript(r.exp1, this.paramName)} ${r.comparator} ${GenerationUtil.langExpToTypeScript(r.exp2, this.paramName)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, ${this.paramName}, ${locationdescription}, ${severity} ));
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
                message = `"'" + ${GenerationUtil.langExpToTypeScript(r.property, this.paramName)} + "' is not a valid identifier"`;
            }
            return `if (!this.isValidName(${GenerationUtil.langExpToTypeScript(r.property, this.paramName)})) {
                    this.errorList.push( new ${Names.FreError}( ${message}, ${this.paramName}, ${locationdescription}, ${severity} ));
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
            return `if (${GenerationUtil.langExpToTypeScript(r.property, this.paramName)}.length === 0) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${this.paramName}, ${locationdescription}, "${r.property.toFreString()}", ${severity}));
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
                message = `"Type " + this.typer.inferType(${GenerationUtil.langExpToTypeScript(r.type1, this.paramName)})?.toFreString(this.myWriter) + " of [" + this.myWriter.writeNameOnly(${GenerationUtil.langExpToTypeScript(r.type1, this.paramName)}) +
                         "] does not conform to " + this.myWriter.writeNameOnly(${GenerationUtil.langExpToTypeScript(r.type2, this.paramName)})`;
            }
            return `if (!this.typer.conformsType(${GenerationUtil.langExpToTypeScript(r.type1, this.paramName)}, ${GenerationUtil.langExpToTypeScript(r.type2, this.paramName)})) {
                    this.errorList.push(new ${Names.FreError}(${message}, ${GenerationUtil.langExpToTypeScript(r.type1, this.paramName)}, ${locationdescription}, ${severity}));
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
            const leftElement: string = GenerationUtil.langExpToTypeScript(r.type1, this.paramName);
            const rightElement: string = GenerationUtil.langExpToTypeScript(r.type2, this.paramName);
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
                listpropertyTypescript = GenerationUtil.langExpToTypeScript(rule.listproperty.appliedfeature, this.paramName);
            }
            //
            let refAddition: string = "";
            let howToWriteName: string = "this.myWriter.writeNameOnly(elem)";
            if (!!rule.list.findRefOfLastAppliedFeature() && !rule.list.findRefOfLastAppliedFeature()!.isPart) {
                // the elements in the list are all FreElementReferences
                refAddition += ".referred";
                howToWriteName = "elem.name"; // if the list element is a reference there is no need to call the writer
            }
            //
            if (!message || message.length === 0) {
                message = `\`The value of property '${listpropertyName}' (\"\${${howToWriteName}}\") is not unique in list '${listName}'\``;
            }
            return `let ${uniquelistName}: ${listpropertyTypeName}[] = [];
        ${GenerationUtil.langExpToTypeScript(rule.list, this.paramName)}.forEach((elem, index) => {
            if ((elem === undefined) || (elem === null)) {
                this.errorList.push(new ${Names.FreError}(\`Element[\$\{index\}] of property '${listName}' has no value\`,
                 ${GenerationUtil.langExpToTypeScript(rule.list, this.paramName)}[index]${refAddition},
                 ${locationdescription},
                 "${listpropertyName}",
                 ${severity}));
                    ${rule.severity.severity === FreErrorSeverity.Error ? `hasFatalError = true;` : ``}
            } else {
                if (!${uniquelistName}.includes(elem.${listpropertyTypescript})){
                    ${uniquelistName}.push(elem.${listpropertyTypescript});
                } else {
                    this.errorList.push(new ${Names.FreError}(${message},
                     ${GenerationUtil.langExpToTypeScript(rule.list, this.paramName)}[index]${refAddition},
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
                } else if (cont instanceof ValidationMessageReference && !!cont.expression) {
                    if (cont.expression.findRefOfLastAppliedFeature() instanceof FreMetaPrimitiveProperty) {
                        result += `\${${GenerationUtil.langExpToTypeScript(cont.expression, this.paramName)}}`;
                    } else {
                        // console.log("FOUND message expression: '" + cont.expression.toFreString() + "'");
                        result += `\${this.myWriter.writeToString(${GenerationUtil.langExpToTypeScript(cont.expression, this.paramName)})}`;
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
