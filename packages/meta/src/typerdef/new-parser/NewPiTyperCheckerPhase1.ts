import { Checker, LangUtil } from "../../utils";
import {
    PiLanguage,
    PiClassifier,
    PiLangExpressionChecker,
    PiElementReference,
    PiLimitedConcept, PiProperty, PiInterface, PiConcept
} from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";
import {
    PitAnytypeExp,
    PitAnyTypeRule,
    PitClassifierRule,
    PitConformanceOrEqualsRule,
    PitExp,
    PitFunctionCallExp,
    PitInferenceRule,
    PitInstanceExp,
    PitLimitedRule,
    PitPropertyCallExp,
    PitSelfExp,
    PitSingleRule,
    PitStatement,
    PitWhereExp,
    PiTyperDef
} from "../new-metalanguage";
import { ListUtil } from "../../utils/ListUtil";
import { PiTyperCheckerPhase2 } from "./PiTyperCheckerPhase2";
import { PitExpWithType } from "../new-metalanguage/expressions/PitExpWithType";
import { PitClassifierCallExp } from "../new-metalanguage/expressions/PitClassifierCallExp";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";

const LOGGER = new MetaLogger("NewPiTyperChecker"); //.mute();
export const validFunctionNames: string[] = ["typeof", "commonSuperType", "ownerOfType"];

export class NewPiTyperCheckerPhase1 extends Checker<PiTyperDef> {
    definition: PiTyperDef;
    myExpressionChecker: PiLangExpressionChecker;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    // TODO clean up this code
    public check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }
        definition.language = this.language;

        this.checkTypeReferences(definition.__types_references);
        this.checkTypeReferences(definition.__conceptsWithType_references);
        // from now on we can use the getters 'types' and 'conceptsWithType'!
        // all references that cannot be found are filtered out!

        // add all classifiers that are types or have a type, because they inherit
        // from a concept or interface that is a type, or has a type
        definition.types = this.addInheritedClassifiers(definition.types);
        // console.log("found types: " + definition.types.map(t => t.name).join(", "))
        definition.conceptsWithType = this.addInheritedClassifiers(definition.conceptsWithType);

        if (!!definition.anyTypeRule) {
            this.checkAnyTypeRule(definition.anyTypeRule);
        } else {
            if (!!definition.classifierRules) {
                // maybe one of the PitConformanceOrEqualsRules is actually a PitAnyTypeRule
                // check this and make the neccessary changes
                let anyTypeRuleIndex: number = -1;
                definition.classifierRules.forEach((rule, index) => {
                    if (rule.__myClassifier.name === "anytype" && rule instanceof PitConformanceOrEqualsRule) {
                        // TODO ask David about other way of parsing
                        // make a copy of the information into an object of another class
                        const newRule: PitAnyTypeRule = new PitAnyTypeRule();
                        newRule.myRules = rule.myRules;
                        newRule.agl_location = rule.agl_location;
                        // set the new rule
                        definition.anyTypeRule = newRule;
                        this.checkAnyTypeRule(newRule);
                        // remember the location of the incorrect rule
                        anyTypeRuleIndex = index;
                    }
                });
                // remove the found incorrect PitConformanceOrEqualsRule
                if (anyTypeRuleIndex > -1) {
                    definition.classifierRules.splice(anyTypeRuleIndex, 1);
                }
            }
        }

        if (!!definition.classifierRules) {
            definition.classifierRules.forEach((rule, index) => {
                this.checkClassifierRule(rule);
            });
        }

        if (!!definition.conceptsWithType) {
            definition.conceptsWithType.forEach(con => {
                if (con instanceof PiConcept && !con.isAbstract) {
                    let conRule = definition.classifierRules.find(rule => rule.__myClassifier.name === con.name && rule instanceof PitInferenceRule);
                    if (!conRule) { // try finding rules for a superclsssifier
                        const supers: PiClassifier[] = LangUtil.superClassifiers(con);
                        for (const super1 of supers) {
                            const rule: PitClassifierRule = definition.classifierRules.find(rule => rule.__myClassifier.name === super1.name && rule instanceof PitInferenceRule);
                            if (!!rule) {
                                conRule = rule;
                            }
                        }
                    }
                    // TODO no error when there is a rule for a superclass
                    this.simpleCheck(
                        !!conRule,
                        `Concept '${con.name}' is marked 'hasType', but has no 'inferType' rule ${Checker.location(definition)}.`
                    );
                }
            });
        }

        this.errors = this.errors.concat(this.myExpressionChecker.errors);

        // when everything has been checked we can do even more ...
        // lets find the return types of each rule, and check type conformance in the rules
        // let's find the top of the type hierarchy, if present

        const phase2: PiTyperCheckerPhase2 = new PiTyperCheckerPhase2(this.language);
        phase2.check(definition);
        if (phase2.hasErrors()) {
            this.errors.push(...phase2.errors);
        }
        if (phase2.hasWarnings()) {
            this.warnings.push(...phase2.warnings);
        }
    }

    private checkTypeReferences(types: PiElementReference<PiClassifier>[]) {
        // LOGGER.log("Checking types: '" + types.map(t => t.name).join(", ") + "'");
        if (!!types) {
            for (const t of types) {
                t.owner = this.language;
                this.myExpressionChecker.checkClassifierReference(t);
                if (!!t.referred) { // error message given by myExpressionChecker
                    this.nestedCheck({
                        check: !this.typeConcepts.includes(t.referred),
                        error: `Concept or interface '${t.name}' occurs more than once in this list ${Checker.location(t)}.`,
                        whenOk: () => {
                            this.typeConcepts.push(t.referred);
                        }
                    });
                }
            }
        }
    }

    private addInheritedClassifiers(types: PiClassifier[]): PiClassifier[] {
        // LOGGER.log("addInheritedConcepts to: '" + types.map(t => t.name).join(", ") + "'");
        const result: PiClassifier[] = [];
        result.push(...types);
        if (!!types) {
            types.forEach((t: PiClassifier) => {
                ListUtil.addListIfNotPresent<PiClassifier>(result, LangUtil.findAllImplementorsAndSubs(t));
            });
        }
        return result;
    }

    private checkAnyTypeRule(rule: PitAnyTypeRule) {
        // LOGGER.log("Checking anyTypeRule '" + rule.toPiString() + "'");
        rule.myRules.forEach(stat => {
            // check the statement, using the overall model as enclosing concept
            this.checkSingleRule(stat, this.language.modelConcept);
        });
    }

    private checkClassifierRule(rule: PitClassifierRule) {
        // LOGGER.log("Checking PitClassifierRule '" + rule.toPiString() + "'");
        this.myExpressionChecker.checkClassifierReference(rule.__myClassifier);
        rule.__myClassifier.owner = this.language;
        if (!!rule.__myClassifier.referred) { // error message done by myExpressionChecker
            const classifier: PiClassifier = rule.myClassifier;
            // see whether there are two or more rules for one concept or interface
            this.nestedCheck({
                check: !this.conceptsWithRules.includes(classifier),
                error: `Only one rule allowed per concept or interface ${Checker.location(rule)}.`,
                whenOk: () => {
                    this.conceptsWithRules.push(classifier);
                    // now check the rule itself
                    if (rule instanceof PitInferenceRule) {
                        this.checkInferenceRule(rule, classifier);
                    } else if (rule instanceof PitConformanceOrEqualsRule) {
                        this.checkConformanceOrEqualsRule(rule, classifier);
                    } else if (rule instanceof PitLimitedRule) {
                        this.checkLimitedRule(rule, classifier);
                    }
                }
            });
        }
    }

    private checkInferenceRule(rule: PitInferenceRule, classifier: PiClassifier) {
        this.simpleCheck(this.definition.conceptsWithType.includes(classifier),
            `Concept or interface '${classifier.name}' is not marked 'hasType', therefore it cannot have an infertype rule ${Checker.location(rule)}.`);
        rule.exp = this.changeInstanceToPropCallExp(rule.exp, classifier);
        this.checkPitExp(rule.exp, classifier);
        rule.returnType = rule.exp.returnType;
    }

    private checkConformanceOrEqualsRule(rule: PitConformanceOrEqualsRule, classifier: PiClassifier) {
        this.simpleCheck(this.definition.types.includes(classifier),
            `Concept or interface '${classifier.name}' is not marked 'isType', therefore it cannot have a conforms or equals rule ${Checker.location(rule)}.`);
        for (const stat of rule.myRules) {
            this.checkSingleRule(stat, classifier);
        }
    }

    private checkLimitedRule(rule: PitLimitedRule, classifier: PiClassifier) {
        for (const stat of rule.statements) {
            this.checkStatement(stat, classifier);
        }
    }

    private checkSingleRule(rule: PitSingleRule, classifier: PiClassifier) {
        rule.exp = this.changeInstanceToPropCallExp(rule.exp, classifier);
        this.checkPitExp(rule.exp, classifier);
    }

    private checkStatement(stat: PitStatement, classifier: PiClassifier, surroundingExp?: PitWhereExp) {
        // LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        stat.left = this.changeInstanceToPropCallExp(stat.left, classifier);
        this.checkPitExp(stat.left, classifier, surroundingExp);
        stat.right = this.changeInstanceToPropCallExp(stat.right, classifier);
        this.checkPitExp(stat.right, classifier, surroundingExp);
        // TODO check use of function calls on property of whereExp
    }

    private changeInstanceToPropCallExp(exp: PitExp, classifier: PiClassifier): PitExp {
        // TODO this should be handled in Semantic Analysis Phase of parser
        let result: PitExp = exp;
        if (exp instanceof PitInstanceExp) {
            if (!exp.__myLimited) {
                if (!(classifier instanceof PiLimitedConcept)) {
                    // console.log("FOUND PitInstanceExp, but suspect it is a PitPropertyCallExp: " + exp.toPiString())
                    result = new PitPropertyCallExp();
                    result.agl_location = exp.agl_location;
                    (result as PitPropertyCallExp).__property =
                        PiElementReference.create<PiProperty>(exp.__myInstance.name, "PiProperty");
                    (result as PitPropertyCallExp).__property.agl_location = exp.__myInstance.agl_location;
                }
            }
        }
        return result;
    }

    private checkPitExp(exp: PitExp, classifier: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // LOGGER.log("Checking PitExp '" + exp.toPiString() + "'");
        exp.language = this.language;
        if (exp instanceof PitAnytypeExp ) {
            // nothing to check
            exp.returnType = PiClassifier.ANY;
        } else if (exp instanceof PitSelfExp) {
            // nothing to check
            exp.returnType = classifier;
        } else if (exp instanceof PitExpWithType) {
            this.checkPitExp(exp.inner, classifier, surroundingExp, surroundingAllowed);
            // console.log("checking " + exp.inner.returnType?.name + " against " + exp.expectedType.name)
            if (!!exp.inner.returnType) {
                this.simpleWarning(
                    LangUtil.conforms(exp.inner.returnType, exp.expectedType),
                    `Expected type '${exp.expectedType.name}', but found type '${exp.inner.returnType.name}' ${Checker.location(exp)}.`);
            }
            exp.returnType = exp.expectedType;
        } else if (exp instanceof PitFunctionCallExp) {
            this.checkFunctionCallExpression(exp, classifier, surroundingExp);
            // exp.returnType cannot be set, because this depends on the inferType rules
            // but we do know that it should be one of the classifiers marked 'isType'
            exp.returnType = this.functionReturnType();
        } else if (exp instanceof PitPropertyCallExp ) {
            this.checkPropertyCallExp(exp, classifier, surroundingExp, surroundingAllowed);
            exp.returnType = exp.property?.type;
        } else if (exp instanceof PitInstanceExp) {
            this.checkInstanceExp(exp, classifier);
            exp.returnType = exp.myLimited;
        } else if (exp instanceof PitWhereExp) {
            exp.returnType = exp.otherType?.type;
            this.checkWhereExp(exp, classifier);
        }
    }

    private checkWhereExp(exp: PitWhereExp, classifier: PiClassifier) {
        // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
        exp.otherType.refType.owner = this.language; // the type of the new property must be declared within the language
        this.nestedCheck({
            check: !!exp.otherType.type,
            error: `Cannot find type '${exp.otherType.refType.name}' ${Checker.location(exp.otherType.refType)}.`,
            whenOk: () => {
                this.simpleCheck(this.definition.types.includes(exp.otherType.type),
                    `Concept or interface '${exp.otherType.refType.name}' is not marked 'isType' ${Checker.location(exp.otherType.refType)}.`);
                exp.conditions.forEach(cond => {
                    this.checkStatement(cond, classifier, exp);
                });
                // exp.returnType = exp.otherType.type;
            }
        });
    }

    private checkInstanceExp(exp: PitInstanceExp, classifier: PiClassifier) {
        exp.__myInstance.owner = this.language;
        if (!!exp.__myLimited) {
            exp.__myLimited.owner = this.language;
            this.simpleCheck(
                !!exp.myLimited,
                `Cannot find limited concept '${exp.__myLimited.name}' ${Checker.location(exp.__myLimited)}.`);
        } else {
            // use the enclosing classifier as limited concept
            if (classifier instanceof PiLimitedConcept) {
                exp.myLimited = classifier;
            }
        }
        // exp.returnType = exp.myLimited;
        this.nestedCheck({
            check: !!exp.myInstance,
            error: `Cannot find instance '${exp.__myInstance.name}' of '${exp.__myLimited?.name}' ${Checker.location(exp.__myInstance)}.`,
            whenOk: () => {
                this.simpleCheck(!!exp.myLimited.findInstance(exp.__myInstance.name),
                    `Instance '${exp.__myInstance.name}' is not of type '${exp.__myLimited.name}' ${Checker.location(exp.__myInstance)}.`);
            }
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp, classifier: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // if (classifier.name === "GenericLiteral") {
        //     console.log("checking property call " + exp.toPiString());
        // }
        // The parameter surroundingAllowed is present to be able to give better errors messages.
        // It indicates whether or not the property from the surrounding whereExp may be used.
        if (surroundingAllowed === null || surroundingAllowed === undefined) {
            surroundingAllowed = true;
        }
        let errMessDone: boolean = false;
        let owningClassifier: PiClassifier = null;
        if (!!exp.source) {
            // if (classifier.name === "GenericLiteral") {
            //     console.log("source: " + exp.source.toPiString() + ", " + exp.source.constructor.name);
            // }
            exp.source = this.changeInstanceToPropCallExp(exp.source, classifier);
            this.checkPitExp(exp.source, classifier, surroundingExp, surroundingAllowed);
            exp.__property.owner = exp.source.returnType;
            owningClassifier = exp.source.returnType;
            if (exp.source instanceof PitFunctionCallExp){
                errMessDone = true; // we do not yet know the return type, therefore we cannot give a correct error message
                this.simpleCheck(
                    false,
                    `Return type of '${exp.source.toPiString()}' cannot be determined, please add an 'as'-clause ${Checker.location(exp.__property)}.`
                );
            }
        } else {
            // if (classifier.name === "GenericLiteral") {
            //     console.log("found type: " + exp.__property?.owner?.name);
            // }
            if (!!surroundingExp) {
                owningClassifier = surroundingExp.otherType.type;
                // use the surrounding PitWhereExp, because there an extra prop is defined
                if (exp.__property.name === surroundingExp.otherType.name) {
                    if (!surroundingAllowed) {
                        this.simpleCheck(
                            false,
                            `Reference to property '${exp.__property.name}' is not allowed ${Checker.location(exp.__property)}.`
                        );
                        errMessDone = true;
                    }
                    exp.property = surroundingExp.otherType;
                    // exp.returnType = exp.property.type;
                }
                // console.log(exp.toPiString() + " using surrounding exp: " + exp.property.name)
            }
        }

        if (!errMessDone) {
            this.nestedCheck({
                check: !!exp.property,
                error: `Cannot find property '${exp.__property.name}' in classifier '${owningClassifier?.name}' ${Checker.location(exp.__property)}.`,
                whenOk: () => {
                    // exp.returnType = exp.property.type;
                }
            });
        }
    }

    private checkFunctionCallExpression(exp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        // LOGGER.log("checkFunctionCallExpression " + exp?.toPiString());
        // TODO extra check: may not have source

        const functionName = validFunctionNames.find(name => name === exp.calledFunction);
        this.nestedCheck({
            check: !!functionName,
            error: `${exp.calledFunction} is not a valid function ${Checker.location(exp)}.`,
            whenOk: () => {
                if (exp.calledFunction === validFunctionNames[0]) { // "typeof"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[2]) { // "ownerOfType"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error: `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`,
                        whenOk: () => {
                            // the returntype is calcalated based on the common super type of the arguments
                            this.setReturntoArgumentType(exp);
                        }
                    });
                }
            }
        });
    }

    private setReturntoArgumentType(exp: PitFunctionCallExp) {
        // TODO this should be parsed as a PitClassifierCallExp, but for now we use the parsed PitInstanceExp
        // console.log("metatype of argument: " + exp.actualParameters[0].constructor.name)
        // change PitInstanceExp to PitClassifierCallExp
        const myArg = this.changeInstanceToClassifierExp(exp.actualParameters[0]); // we know there is only one argument to 'ownerOfType'
        if (myArg instanceof PitClassifierCallExp) {
            exp.actualParameters[0] = myArg;
            exp.returnType = myArg.myClassifier;
        } else {
            exp.returnType = PiClassifier.ANY;
        }
        // console.log("returnType is: " + exp.returnType.name);
    }

    private changeInstanceToClassifierExp(exp: PitExp): PitExp {
        // TODO this should be handled in Semantic Analysis Phase of parser
        let result: PitExp = exp;
        if (exp instanceof PitInstanceExp) {
            if (!exp.__myLimited) { // a single reference is found
                const classifier: PiClassifier = this.language.findClassifier(exp.__myInstance.name);
                if (!!classifier) {
                    // console.log("FOUND PitInstanceExp, but suspect it is a PitClassifierCallExp: " + exp.toPiString())
                    result = new PitClassifierCallExp();
                    result.agl_location = exp.agl_location;
                    (result as PitClassifierCallExp).__myClassifier =
                        PiElementReference.create<PiClassifier>(exp.__myInstance.name, "PiClassifier");
                    (result as PitClassifierCallExp).__myClassifier.agl_location = exp.__myInstance.agl_location;
                }
            }
        }
        return result;
    }

    private checkArguments(langExp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        const newArgs: PitExp[] = [];
        langExp.actualParameters.forEach(p => {
                newArgs.push(this.changeInstanceToPropCallExp(p, enclosingConcept));
            }
        );
        newArgs.forEach(p => {
                this.checkPitExp(p, enclosingConcept, surroundingExp, false);
            }
        );
    }

    private functionReturnType(): PiClassifier {
        const possibleTypes: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(this.definition.types);
        if (possibleTypes.length === 1) {
            return possibleTypes[0];
        } else {
            console.log("cannot find a common base type for the functions, found: " + possibleTypes.map(pos => pos.name).join(", "))
        }
        return undefined;
    }
}
