import {
    LangUtil,
    Names,
    MetaLogger,
    ListUtil,
    reservedWordsInTypescript,
    piReservedWords, CheckRunner, CheckerPhase, ParseLocationUtil
} from "../../utils";
import {
    PiLanguage,
    PiClassifier,
    PiElementReference,
    PiLimitedConcept, PiProperty, PiPrimitiveType, PiMetaEnvironment, PiInstance, PiConcept
} from "../../languagedef/metalanguage";
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
    PiTyperDef,
    PitEqualsRule, PitBinaryExp, PitCreateExp, PitVarCallExp, PitTypeConcept
} from "../metalanguage";
import { PitScoper } from "./PitScoper";
import { PitOwnerSetter } from "./PitOwnerSetter";
import { CommonChecker, CommonSuperTypeUtil } from "../../languagedef/checking";

const LOGGER = new MetaLogger("NewPiTyperChecker"); //.mute();
export const validFunctionNames: string[] = ["typeof", "commonSuperType", "ownerOfType"];

/**
 * This class is the main checker for the typer definition. It can be augmented by a phase 2 checker,
 * if needed.
 */
export class PiTyperCheckerPhase1 extends CheckerPhase<PiTyperDef>{
    language: PiLanguage;
    definition: PiTyperDef;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    public check(definition: PiTyperDef, runner: CheckRunner): void {
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

        this.runner = runner;

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
            definition.classifierSpecs.forEach(spec => {
                this.checkClassifierSpec(spec);
                if (!allClassifiers.includes(spec.myClassifier)) {
                    allClassifiers.push(spec.myClassifier);
                } else {
                    this.runner.simpleCheck(false, `There may be only one specification for a concept or interface ${ParseLocationUtil.location(spec)}.`);
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
                    this.runner.simpleCheck(
                        !!foundRule,
                        `Concept '${con.name}' is marked 'hasType', but has no 'inferType' rule ${ParseLocationUtil.location(definition.conceptsWithType[0])}.`
                    );
                }
            });
        }

        // when everything has been checked we can do even more ...
        // lets find the return types of each rule, and check type conformance in the rules
        // let's find the top of the type hierarchy, if present
        // TODO see what needs to be implemented in phase 2

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
                CommonChecker.checkClassifierReference(t, this.runner);
                if (!!t.referred) { // error message given by myExpressionChecker
                    this.runner.nestedCheck({
                        check: !this.typeConcepts.includes(t.referred),
                        error: `Concept or interface '${t.name}' occurs more than once in this list ${ParseLocationUtil.location(t)}.`,
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
        CommonChecker.checkClassifierReference(spec.__myClassifier, this.runner);
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
        this.runner.simpleCheck(enclosingConcept !== this.language.modelConcept,
            `'Anytype' cannot have an infertype rule ${ParseLocationUtil.location(rule)}.`);
        this.runner.simpleCheck(this.definition.conceptsWithType.includes(enclosingConcept),
            `Concept or interface '${enclosingConcept.name}' is not marked 'hastype', therefore it cannot have an infertype rule ${ParseLocationUtil.location(rule)}.`);
        this.runner.simpleCheck(!(rule.exp instanceof PitWhereExp), `A 'where' expression may not be used in an 'infertype' rule, please use 'Concept {...}' ${ParseLocationUtil.location(rule)}.`);
        // rule.exp = this.changeInstanceToPropCallExp(rule.exp, enclosingConcept);
    }

    private checkConformanceRule(rule: PitConformanceRule, enclosingConcept: PiClassifier) {
        if (enclosingConcept !== this.language.modelConcept) {
            this.runner.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have a conformance rule ${ParseLocationUtil.location(rule)}.`);
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
            this.runner.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have an equals rule ${ParseLocationUtil.location(rule)}.`);
        }
    }

    private checkLimitedRule(rule: PitLimitedRule, enclosingConcept: PiClassifier) {
        // LOGGER.log("Checking limited rule '" + rule.toPiString() + "' for " + enclosingConcept.name );
        this.runner.simpleCheck(enclosingConcept instanceof PiLimitedConcept,
            `This type of rule may only be used for limited concepts ${ParseLocationUtil.location(rule)}.`);
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
        this.checkTypeReference(exp.__type, false);
        // console.log("TYPE of Create: " + exp.__type.name + ", " + exp.__type.owner + ", " + exp.type?.name);
        // this.myExpressionthis.runner.checkClassifierReference(exp.__type);
        // console.log("TYPE: " + exp.type?.name + " with props: " + exp.type?.allProperties().map(p => p.name).join(", "))
        exp.propertyDefs.forEach(propDef => {
            this.checkPitExp(propDef.value, classifier, surroundingExp);
            this.runner.nestedCheck({
                check:!!propDef.property,
                error:`Cannot find property '${propDef.__property.name}' ${ParseLocationUtil.location(propDef.__property)}.`,
                whenOk: () => {
                    const propType: PiClassifier = propDef.property.type;
                    const valueType: PiClassifier = propDef.value.returnType;
                    let doesConform: boolean;
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
                    this.runner.simpleCheck(doesConform,
                        `Type of '${propDef.value.toPiString()}' (${valueType?.name}) does not conform to ${propType.name} ${ParseLocationUtil.location(propDef)}.`);
                }
            });
        });
    }

    private checkWhereExp(exp: PitWhereExp, classifier: PiClassifier) {
        // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
        this.runner.nestedCheck({
            check: !!exp.variable.type,
            error: `Cannot find type '${exp.variable.__type.name}' ${ParseLocationUtil.location(exp.variable.__type)}.`,
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
            this.runner.simpleCheck(
                !!exp.myLimited,
                `Cannot find limited concept '${exp.__myLimited.name}' ${ParseLocationUtil.location(exp.__myLimited)}.`);
        } else {
            // use the enclosing classifier as limited concept
            if (classifier instanceof PiLimitedConcept) {
                exp.myLimited = classifier;
            }
        }
        this.runner.nestedCheck({
            check: !!exp.myInstance,
            error: `Cannot find instance '${exp.__myInstance.name}' of '${exp.__myLimited?.name}' ${ParseLocationUtil.location(exp.__myInstance)}.`,
            whenOk: () => {
                this.runner.simpleCheck(!!exp.myLimited.findInstance(exp.__myInstance.name),
                    `Instance '${exp.__myInstance.name}' is not of type '${exp.__myLimited.name}' ${ParseLocationUtil.location(exp.__myInstance)}.`);
            }
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp, enclosingConcept: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // console.log("Checking PitPropertyCallExp '" + exp.toPiString() + "'");
        if (!!exp.source) {
            this.checkPitExp(exp.source, enclosingConcept, surroundingExp, surroundingAllowed);
            // console.log("found source: " + exp.source.toPiString() + " of type " + exp.source.returnType.name);
            this.runner.nestedCheck({
                check: !!exp.property,
                error: `Cannot find property '${exp.__property.name}' in classifier '${exp.source.returnType?.name}' ${ParseLocationUtil.location(exp.__property)}.`,
                whenOk: () => {
                    exp.returnType = exp.property.type;
                }
            });
        }
    }

    private checkVarCallExp(exp: PitVarCallExp) {
        // LOGGER.log("Checking checkVarCallExp '" + exp.toPiString() + "'");
        this.runner.nestedCheck({
            check: !!exp.variable,
            error: `Cannot find reference to ${exp.__variable.name} ${ParseLocationUtil.location(exp.__variable)}.`,
            whenOk: () => {
                exp.returnType = exp.variable.type;
            }
        });
    }

    private checkFunctionCallExpression(exp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        // LOGGER.log("checkFunctionCallExpression " + exp?.toPiString());
        const functionName = validFunctionNames.find(name => name === exp.calledFunction);
        this.runner.nestedCheck({
            check: !!functionName,
            error: `${exp.calledFunction} is not a valid function ${ParseLocationUtil.location(exp)}.`,
            whenOk: () => {
                if (exp.calledFunction === validFunctionNames[0]) { // "typeof"
                    this.runner.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${ParseLocationUtil.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                            exp.returnType = PiTyperDef.freonType;
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
                    this.runner.nestedCheck({
                        check: exp.actualParameters.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${exp.actualParameters.length} ${ParseLocationUtil.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                            exp.returnType = PiTyperDef.freonType;
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[2]) { // "ownerOfType"
                    this.runner.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error: `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${ParseLocationUtil.location(exp)}.`,
                        whenOk: () => {
                            exp.returnType = exp.actualParameters[0].returnType;
                        }
                    });
                }
            }
        });
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
            this.runner.simpleCheck(
                !foundASTconcept,
                `Name of type concept (${piConcept.name}) may not be equal to a concept or interface in the structure definition (.ast) ${ParseLocationUtil.location(piConcept)}.`
            );
            this.runner.simpleCheck(!(piReservedWords.includes(piConcept.name.toLowerCase())), `Concept may not have a name that is equal to a reserved word ('${piConcept.name}') ${ParseLocationUtil.location(piConcept)}.`);
            this.runner.simpleCheck(!(reservedWordsInTypescript.includes(piConcept.name.toLowerCase())),
                `Concept may not have a name that is equal to a reserved word in TypeScript ('${piConcept.name}') ${ParseLocationUtil.location(piConcept)}.`);

            // (2) name must be unique within the list 'typeConcepts'
            if (names.includes(piConcept.name)) {
                this.runner.simpleCheck(false,
                    `Type concept with name '${piConcept.name}' already exists ${ParseLocationUtil.location(piConcept)}.`);
            } else {
                names.push(Names.startWithUpperCase(piConcept.name));
                names.push(piConcept.name);
            }
            // (3) base concept, if present, must be known within 'typeConcepts'
            if (!!piConcept.base) {
                this.checkTypeReference(piConcept.base, true);
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
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(piProperty.name.toLowerCase())),
            `Property may not have a name that is equal to a reserved word in TypeScript ('${piProperty.name}') ${ParseLocationUtil.location(piProperty)}.`);
        // (4) the types of the properties must be known, either as classifiers in the AST,
        //      or as type concepts
        if (piProperty instanceof PitProperty) {
            this.checkTypeReference(piProperty.typeReference, false);
        } else {
            CommonChecker.checkClassifierReference(piProperty.typeReference, this.runner);
        }
        // the following checks are done in phase2
        // (5) property names must be unique within one concept
        // (6) check inherited props on rules layed out in languagedef checker
    }

    private checkTypeReference(refType: PiElementReference<PiClassifier>, typeConceptRequired: boolean) {
        this.runner.nestedCheck({
            check: !!refType.referred,
            error: `Cannot find reference to ${refType.name} ${ParseLocationUtil.location(refType)}.`,
            whenOk: () => {
                if (typeConceptRequired) {
                    this.runner.simpleCheck(refType.referred instanceof PitTypeConcept, `Only type concepts allowed ${ParseLocationUtil.location(refType)}.`);
                }
            }
        });
    }
}
