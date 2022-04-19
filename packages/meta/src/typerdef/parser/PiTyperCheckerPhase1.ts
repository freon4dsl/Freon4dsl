import { Checker, LangUtil, Names } from "../../utils";
import {
    PiLanguage,
    PiClassifier,
    PiLangExpressionChecker,
    PiElementReference,
    PiLimitedConcept, PiProperty, PiPrimitiveType, PiMetaEnvironment, PiInstance, PiConcept
} from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";
import {
    PitAnytypeExp,
    PitAnyTypeSpec, PitClassifierSpec, PitConformanceRule,
    PitExp,
    PitFunctionCallExp,
    PitInferenceRule,
    PitLimitedInstanceExp,
    PitLimitedRule, PitProperty,
    PitPropertyCallExp, PitSelfExp, PitTypeRule,
    PitWhereExp,
    PiTyperDef
} from "../metalanguage";
import { ListUtil } from "../../utils/ListUtil";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";
import { PitTypeConcept } from "../metalanguage/PitTypeConcept";
import { reservedWordsInTypescript } from "../../validatordef/generator/templates/ReservedWords";
import { piReservedWords } from "../../languagedef/metalanguage/PiLanguageChecker";
import { PitEqualsRule } from "../metalanguage/PitEqualsRule";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../metalanguage/expressions";
import { PitScoper } from "./PitScoper";
import { PitOwnerSetter } from "./PitOwnerSetter";

const LOGGER = new MetaLogger("NewPiTyperChecker"); //.mute();
export const validFunctionNames: string[] = ["typeof", "commonSuperType", "ownerOfType"];

export class PiTyperCheckerPhase1 extends Checker<PiTyperDef> {
    definition: PiTyperDef;
    myExpressionChecker: PiLangExpressionChecker;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    public check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }
        definition.language = this.language;

        // To be able to find references in the type defintion to nodes other than those form the language
        // we need an extra scoper, and we need to set the opposites of all 'parts': their owning nodes
        PiMetaEnvironment.metascoper.extraScopers.push(new PitScoper(definition));
        PitOwnerSetter.setNodeOwners(definition);

        // now we can start checking
        this.checkTypeReferences(definition.__types);
        this.checkTypeReferences(definition.__conceptsWithType);
        // from now on we can use the getters 'types' and 'conceptsWithType'!
        // all references that cannot be found are filtered out!

        // add all classifiers that are types or have a type, because they inherit
        // from a concept or interface that is a type, or has a type
        definition.types = this.addInheritedClassifiers(definition.types);
        // console.log("found types: " + definition.types.map(t => t.name).join(", "))
        definition.conceptsWithType = this.addInheritedClassifiers(definition.conceptsWithType);
        // console.log("found HAS types: " + definition.conceptsWithType.map(t => t.name).join(", "))

        // check all the type concepts
        this.checkTypeConcepts(this.definition.typeConcepts);
        // console.log(this.definition.toPiString());

        if (!!definition.anyTypeSpec) {
            this.checkAnyTypeRule(definition.anyTypeSpec);
        }

        // check all specs independently, add check whether there is more than one spec for this classifier
        // collect all classifiers for which a spec is defined
        const allClassifiers: PiClassifier[] = [];
        if (!!definition.classifierSpecs) {
            definition.classifierSpecs.forEach((spec, index) => {
                this.checkClassifierSpec(spec);
                if (!allClassifiers.includes(spec.myClassifier)) {
                    allClassifiers.push(spec.myClassifier);
                } else {
                    this.simpleCheck(false, `There may be only one specification for a concept or interface ${Checker.location(spec)}.`);
                }
            });
        }

        // check whether there is a spec for all classifiers marked 'hasType'
        if (!!definition.conceptsWithType) {
            definition.conceptsWithType.forEach(con => {
                if (con instanceof PiConcept && !con.isAbstract) {
                    let foundRule: PitInferenceRule;
                    // see if there is a spec for this concept with an infertype rule
                    this.findSpecsForConcept(con).forEach(spec => {
                        const rule: PitTypeRule = spec.rules.find(r => r instanceof PitInferenceRule);
                        if (!!rule) {
                            foundRule = rule as PitInferenceRule;
                        }
                    });
                    this.simpleCheck(
                        !!foundRule,
                        `Concept '${con.name}' is marked 'hasType', but has no 'inferType' rule ${Checker.location(definition.conceptsWithType[0])}.`
                    );
                }
            });
        }

        this.errors = this.errors.concat(this.myExpressionChecker.errors);

        // when everything has been checked we can do even more ...
        // lets find the return types of each rule, and check type conformance in the rules
        // let's find the top of the type hierarchy, if present

        // const phase2: PiTyperCheckerPhase2 = new PiTyperCheckerPhase2(this.language);
        // phase2.check(definition);
        // if (phase2.hasErrors()) {
        //     this.errors.push(...phase2.errors);
        // }
        // if (phase2.hasWarnings()) {
        //     this.warnings.push(...phase2.warnings);
        // }
    }

    private findSpecsForConcept(con: PiConcept): PitClassifierSpec[] {
        let result: PitClassifierSpec[] = [];
        ListUtil.addIfNotPresent(result, this.definition.classifierSpecs.find(spec => spec.myClassifier === con));
        // try finding specs for a superclassifier
        const supers: PiClassifier[] = LangUtil.superClassifiers(con);
        for (const super1 of supers) {
            ListUtil.addIfNotPresent(result, this.definition.classifierSpecs.find(spec => spec.myClassifier === super1));
        }
        return result;
    }

    private checkTypeReferences(types: PiElementReference<PiClassifier>[]) {
        // LOGGER.log("Checking types: '" + types.map(t => t.name).join(", ") + "'");
        if (!!types) {
            for (const t of types) {
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
        ListUtil.addListIfNotPresent<PiClassifier>(result, types);
        if (!!types) {
            types.forEach((t: PiClassifier) => {
                ListUtil.addListIfNotPresent<PiClassifier>(result, LangUtil.findAllImplementorsAndSubs(t));
            });
        }
        return result;
    }

    private checkAnyTypeRule(spec: PitAnyTypeSpec) {
        // LOGGER.log("Checking anyTypeSpec '" + spec.toPiString() + "'");
        spec.rules.forEach(rule => {
            // check the rule, using the overall model as enclosing concept
            this.checkTypeRule(rule, this.language.modelConcept);
        });
    }

    private checkClassifierSpec(spec: PitClassifierSpec) {
        this.myExpressionChecker.checkClassifierReference(spec.__myClassifier);
        if (!!spec.myClassifier) {
            spec.rules.forEach(rule => {
                // check the rule, using the overall model as enclosing concept
                this.checkTypeRule(rule, spec.myClassifier);
            });
        }
    }

    private checkTypeRule(rule: PitTypeRule, enclosingConcept: PiClassifier) {
        if (rule instanceof PitInferenceRule) {
            this.checkInferenceRule(rule, enclosingConcept);
        } else if (rule instanceof PitConformanceRule) {
            this.checkConformanceRule(rule, enclosingConcept);
        } else if (rule instanceof PitEqualsRule) {
            this.checkEqualsRule(rule, enclosingConcept);
        } else if (rule instanceof PitLimitedRule) {
            this.checkLimitedRule(rule, enclosingConcept);
        }
        this.checkPitExp(rule.exp, enclosingConcept);
        rule.returnType = rule.exp.returnType;
    }

    private checkInferenceRule(rule: PitInferenceRule, enclosingConcept: PiClassifier) {
        this.simpleCheck(enclosingConcept !== this.language.modelConcept,
            `'Anytype' cannot have an infertype rule ${Checker.location(rule)}.`);
        this.simpleCheck(this.definition.conceptsWithType.includes(enclosingConcept),
            `Concept or interface '${enclosingConcept.name}' is not marked 'hastype', therefore it cannot have an infertype rule ${Checker.location(rule)}.`);
        this.simpleCheck(!(rule.exp instanceof PitWhereExp), `A 'where' expression may not be used in an 'infertype' rule, please use 'Concept {...}' ${Checker.location(rule)}.`);
        // rule.exp = this.changeInstanceToPropCallExp(rule.exp, enclosingConcept);
    }

    private checkConformanceRule(rule: PitConformanceRule, enclosingConcept: PiClassifier) {
        if (enclosingConcept !== this.language.modelConcept) {
            this.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have a conformance rule ${Checker.location(rule)}.`);
        }
    }

    private isMarkedIsType(enclosingConcept: PiClassifier): boolean {
        let isTypeConcept: boolean = this.definition.types.includes(enclosingConcept);
        if (!isTypeConcept && enclosingConcept instanceof PitTypeConcept) {
            isTypeConcept = this.definition.typeConcepts.includes(enclosingConcept);
        }
        return isTypeConcept;
    }

    private checkEqualsRule(rule: PitEqualsRule, enclosingConcept: PiClassifier) {
        if (enclosingConcept !== this.language.modelConcept) {
            this.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have an equals rule ${Checker.location(rule)}.`);
        }
    }

    private checkLimitedRule(rule: PitLimitedRule, enclosingConcept: PiClassifier) {
        // LOGGER.log("Checking limited rule '" + rule.toPiString() + "' for " + enclosingConcept.name );
        this.simpleCheck(enclosingConcept instanceof PiLimitedConcept,
            `This type of rule may only be used for limited concepts ${Checker.location(rule)}.`);
        // remedy possible parse error, TODO find better solution
        if (rule.exp instanceof PitBinaryExp) {
            if (rule.exp.left instanceof PitVarCallExp) {
                rule.exp.left = this.changeVarCallIntoInstanceExp(rule.exp.left);
            }
            if (rule.exp.right instanceof PitVarCallExp) {
                rule.exp.right = this.changeVarCallIntoInstanceExp(rule.exp.right);
            }
        }
    }

    private changeVarCallIntoInstanceExp(myVarCall: PitVarCallExp): PitLimitedInstanceExp {
        const result: PitLimitedInstanceExp = new PitLimitedInstanceExp();
        result.owner = myVarCall.owner;
        result.__myInstance = PiElementReference.create<PiInstance>(myVarCall.__variable.name, "PiInstance");
        result.__myInstance.owner = result;
        result.agl_location = myVarCall.agl_location;
        return result;
    }

    private checkPitExp(exp: PitExp, enclosingConcept: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // console.log("Checking PitExp '" + exp.toPiString() + "'");
        exp.language = this.language;
        if (exp instanceof PitAnytypeExp ) {
            // nothing to check
            exp.returnType = PiClassifier.ANY;
        } else if (exp instanceof PitBinaryExp) {
            this.checkBinaryExp(exp, enclosingConcept, surroundingExp);
            exp.returnType = PiPrimitiveType.boolean;
        } else if (exp instanceof PitCreateExp) {
            this.checkCreateExp(exp, enclosingConcept);
            exp.returnType = exp.type;
        } else if (exp instanceof PitFunctionCallExp) {
            this.checkFunctionCallExpression(exp, enclosingConcept, surroundingExp);
        } else if (exp instanceof PitLimitedInstanceExp) {
            this.checkInstanceExp(exp, enclosingConcept);
            exp.returnType = exp.myLimited;
        } else if (exp instanceof PitPropertyCallExp ) {
            this.checkPropertyCallExp(exp, enclosingConcept, surroundingExp, surroundingAllowed);
        } else if (exp instanceof PitSelfExp) {
            // nothing to check
            exp.returnType = enclosingConcept;
        } else if (exp instanceof PitVarCallExp) {
            this.checkVarCallExp(exp);
        } else if (exp instanceof PitWhereExp) {
            this.checkWhereExp(exp, enclosingConcept);
        }
    }

    private checkBinaryExp(exp: PitBinaryExp, enclosingConcept: PiClassifier, surroundingExp?: PitWhereExp) {
        // LOGGER.log("Checking PitBinaryExp '" + exp.toPiString() + "'");
        this.checkPitExp(exp.left, enclosingConcept, surroundingExp);
        this.checkPitExp(exp.right, enclosingConcept, surroundingExp);
    }

    private checkCreateExp(exp: PitCreateExp, classifier: PiClassifier, surroundingExp?: PitWhereExp) {
        // LOGGER.log("Checking PitCreateExp '" + exp.toPiString() + "'");
        this.checkClassifierReference(exp.__type, false);
        // console.log("TYPE of Create: " + exp.__type.name + ", " + exp.__type.owner + ", " + exp.type?.name);
        // this.myExpressionChecker.checkClassifierReference(exp.__type);
        // console.log("TYPE: " + exp.type?.name + " with props: " + exp.type?.allProperties().map(p => p.name).join(", "))
        exp.propertyDefs.forEach(propDef => {
            this.checkPitExp(propDef.value, classifier, surroundingExp);
            this.nestedCheck({
                check:!!propDef.property,
                error:`Cannot find property '${propDef.__property.name}' ${Checker.location(propDef.__property)}.`,
                whenOk: () => {
                    const propType: PiClassifier = propDef.property.type;
                    const valueType: PiClassifier = propDef.value.returnType;
                    let doesConform: boolean = false;
                    if (propType !== PiTyperDef.freonType) {
                        const typeCheck: PiClassifier[] = CommonSuperTypeUtil.commonSuperType([propType, valueType]);
                        doesConform = typeCheck.length > 0 && typeCheck[0] === propType;
                    } else {
                        // valueType conforms to PiType if
                        if (valueType === PiTyperDef.freonType) { // (0) it is equal to PiType
                            doesConform = true;
                        } else if (valueType instanceof PitTypeConcept ) { // (1) it is a TypeConcept, or
                            doesConform = this.definition.typeConcepts.includes(valueType);
                        } else { // (2) it is marked 'isType'
                            doesConform = this.definition.types.includes(valueType);
                        }
                    }
                    this.simpleCheck(doesConform,
                        `Type of '${propDef.value.toPiString()}' (${valueType?.name}) does not conform to ${propType.name} ${Checker.location(propDef)}.`);
                }
            });
        });
    }

    private checkWhereExp(exp: PitWhereExp, classifier: PiClassifier) {
        // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
        this.nestedCheck({
            check: !!exp.variable.type,
            error: `Cannot find type '${exp.variable.__type.name}' ${Checker.location(exp.variable.__type)}.`,
            whenOk: () => {
                // check all conditions of the where expression
                exp.conditions.forEach(cond => {
                    this.checkBinaryExp(cond, classifier, exp);
                });
                exp.returnType = exp.variable.type;
            }
        });
    }

    private checkInstanceExp(exp: PitLimitedInstanceExp, classifier: PiClassifier) {
        if (!!exp.__myLimited) {
            this.simpleCheck(
                !!exp.myLimited,
                `Cannot find limited concept '${exp.__myLimited.name}' ${Checker.location(exp.__myLimited)}.`);
        } else {
            // use the enclosing classifier as limited concept
            if (classifier instanceof PiLimitedConcept) {
                exp.myLimited = classifier;
            }
        }
        this.nestedCheck({
            check: !!exp.myInstance,
            error: `Cannot find instance '${exp.__myInstance.name}' of '${exp.__myLimited?.name}' ${Checker.location(exp.__myInstance)}.`,
            whenOk: () => {
                this.simpleCheck(!!exp.myLimited.findInstance(exp.__myInstance.name),
                    `Instance '${exp.__myInstance.name}' is not of type '${exp.__myLimited.name}' ${Checker.location(exp.__myInstance)}.`);
            }
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp, enclosingConcept: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // console.log("Checking PitPropertyCallExp '" + exp.toPiString() + "'");
        if (!!exp.source) {
            this.checkPitExp(exp.source, enclosingConcept, surroundingExp, surroundingAllowed);
            // console.log("found source: " + exp.source.toPiString() + " of type " + exp.source.returnType.name);
            this.nestedCheck({
                check: !!exp.property,
                error: `Cannot find property '${exp.__property.name}' in classifier '${exp.source.returnType?.name}' ${Checker.location(exp.__property)}.`,
                whenOk: () => {
                    exp.returnType = exp.property.type;
                }
            });
        }
    }

    private checkVarCallExp(exp: PitVarCallExp) {
        // LOGGER.log("Checking checkVarCallExp '" + exp.toPiString() + "'");
        this.nestedCheck({
            check: !!exp.variable,
            error: `Cannot find reference to ${exp.__variable.name} ${Checker.location(exp.__variable)}.`,
            whenOk: () => {
                exp.returnType = exp.variable.type;
            }
        });
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
                            exp.returnType = PiTyperDef.freonType;
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                            exp.returnType = PiTyperDef.freonType;
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[2]) { // "ownerOfType"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error: `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`,
                        whenOk: () => {
                            // The returntype is calcalated based on the common super type of the arguments
                            this.setReturntoArgumentType(exp);
                        }
                    });
                }
            }
        });
    }

    private setReturntoArgumentType(exp: PitFunctionCallExp) {
        // // TODO this should be parsed as a PitClassifierCallExp, but for now we use the parsed PitInstanceExp
        // // console.log("metatype of argument: " + exp.actualParameters[0].constructor.name)
        // // change PitInstanceExp to PitClassifierCallExp
        // const myArg = this.changeInstanceToClassifierExp(exp.actualParameters[0]); // we know there is only one argument to 'ownerOfType'
        // if (myArg instanceof PitClassifierCallExp) {
        //     exp.actualParameters[0] = myArg;
        //     exp.returnType = myArg.myClassifier;
        // } else {
        //     exp.returnType = PiClassifier.ANY;
        // }
        // // console.log("returnType is: " + exp.returnType.name);
    }

    private checkArguments(langExp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        langExp.actualParameters.forEach(p => {
                this.checkPitExp(p, enclosingConcept, surroundingExp, false);
            }
        );
    }

    private checkTypeConcepts(typeConcepts: PitTypeConcept[]) {
        const names: string[] = [];
        for (const piConcept of typeConcepts) {
            // (1) name may not be equal to any of the classifiers in the AST
            const foundASTconcept = this.language.conceptsAndInterfaces().find(c => c.name === piConcept.name);
            this.simpleCheck(
                !foundASTconcept,
                `Name of type concept (${piConcept.name}) may not be equal to a concept or interface in the structure definition (.ast) ${Checker.location(piConcept)}.`
            );
            this.simpleCheck(!(piReservedWords.includes(piConcept.name.toLowerCase())), `Concept may not have a name that is equal to a reserved word ('${piConcept.name}') ${Checker.location(piConcept)}.`);
            this.simpleCheck(!(reservedWordsInTypescript.includes(piConcept.name.toLowerCase())),
                `Concept may not have a name that is equal to a reserved word in TypeScript ('${piConcept.name}') ${Checker.location(piConcept)}.`);

            // (2) name must be unique within the list 'typeConcepts'
            if (names.includes(piConcept.name)) {
                this.simpleCheck(false,
                    `Type concept with name '${piConcept.name}' already exists ${Checker.location(piConcept)}.`);
            } else {
                names.push(Names.startWithUpperCase(piConcept.name));
                names.push(piConcept.name);
            }
            // (3) base concept, if present, must be known within 'typeConcepts'
            if (!!piConcept.base) {
                this.checkClassifierReference(piConcept.base, true);
            }

            // check the properties
            piConcept.properties.forEach(part => this.checkTypeConceptProperty(part, piConcept));
        }
    }

    private checkTypeConceptProperty(piProperty: PiProperty, piConcept: PitTypeConcept): void {
        // LOGGER.log("Checking type concept property '" + piProperty.name + "'");
        // set all unused properties of this class
        piProperty.isOptional = false;
        piProperty.isPart = true;
        piProperty.isList = false;
        piProperty.isPublic = false;
        //
        piProperty.owningClassifier = piConcept;
        this.simpleCheck(!(reservedWordsInTypescript.includes(piProperty.name.toLowerCase())),
            `Property may not have a name that is equal to a reserved word in TypeScript ('${piProperty.name}') ${Checker.location(piProperty)}.`);
        // (4) the types of the properties must be known, either as classifiers in the AST,
        //      or as type concepts
        if (piProperty instanceof PitProperty) {
            this.checkClassifierReference(piProperty.refType, false);
        } else {
            this.myExpressionChecker.checkClassifierReference(piProperty.typeReference);
        }
        // (5) property names must be unique within one concept
        // TODO finish checks
        // (6) check inherited props on rules layed out in languagedef checker
    }

    private checkClassifierReference(refType: PiElementReference<PiClassifier>, typeConceptRequired: boolean) {
        this.nestedCheck({
            check: !!refType.referred,
            error: `Cannot find reference to ${refType.name} ${Checker.location(refType)}.`,
            whenOk: () => {
                if (typeConceptRequired) {
                    this.simpleCheck(refType.referred instanceof PitTypeConcept, `Only type concepts allowed ${Checker.location(refType)}.`);
                }
            }
        });
    }
}
