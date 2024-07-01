import {
    CheckRunner,
    CheckerPhase,
    LangUtil,
    ListUtil,
    Names,
    ParseLocationUtil,
    reservedWordsInTypescript,
    freReservedWords
} from "../../utils";
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInstance,
    FreMetaEnvironment,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveType,
    FreMetaProperty,
    MetaElementReference
} from "../../languagedef/metalanguage";
import {
    FretAnytypeExp,
    FretAnyTypeSpec,
    FretBinaryExp,
    FretClassifierSpec,
    FretConformanceRule,
    FretCreateExp,
    FretExp,
    FretEqualsRule,
    FretFunctionCallExp,
    FretInferenceRule,
    FretLimitedInstanceExp,
    FretLimitedRule,
    FretProperty,
    FretPropertyCallExp,
    FretSelfExp,
    FretTypeConcept,
    FretTypeRule,
    FretVarCallExp,
    FretWhereExp,
    TyperDef
} from "../metalanguage";
import { FretScoper } from "./FretScoper";
import { FretOwnerSetter } from "./FretOwnerSetter";
import { CommonChecker, CommonSuperTypeUtil } from "../../languagedef/checking";

// const LOGGER = new MetaLogger("NewFreTyperChecker"); // .mute();
export const validFunctionNames: string[] = ["typeof", "commonSuperType", "ownerOfType"];

/**
 * This class is the main checker for the typer definition. It can be augmented by a phase 2 checker,
 * if needed.
 */
export class FreTyperCheckerPhase1 extends CheckerPhase<TyperDef> {
    // @ts-ignore Property is set by users and its value checked in the only public method 'check'.
    language: FreMetaLanguage;
    // @ts-ignore Property is set in the only public method 'check'.
    definition: TyperDef;
    typeConcepts: FreMetaClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: FreMetaClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    public check(definition: TyperDef, runner: CheckRunner): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        // LOGGER.log("Checking typer definition");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }
        definition.language = this.language;

        // To be able to find references in the type defintion to nodes other than those from the language
        // we need an extra scoper, and we need to set the opposites of all 'parts': their owning nodes
        FreMetaEnvironment.metascoper.language = this.language;
        FreMetaEnvironment.metascoper.extraScopers.push(new FretScoper(definition));
        FretOwnerSetter.setNodeOwners(definition);

        this.runner = runner;

        // now we can start checking
        this.checkTypeReferences(definition.$types);
        this.checkTypeReferences(definition.$conceptsWithType);
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
        // console.log(this.definition.toFreString());

        if (!!definition.anyTypeSpec) {
            this.checkAnyTypeRule(definition.anyTypeSpec);
        }

        // check all specs independently, add check whether there is more than one spec for this classifier
        // collect all classifiers for which a spec is defined
        const allClassifiers: FreMetaClassifier[] = [];
        if (!!definition.classifierSpecs) {
            definition.classifierSpecs.forEach(spec => {
                this.checkClassifierSpec(spec);
                if (!!spec.myClassifier && !allClassifiers.includes(spec.myClassifier)) {
                    allClassifiers.push(spec.myClassifier);
                } else {
                    this.runner.simpleCheck(false, `There may be only one specification for a concept or interface ${ParseLocationUtil.location(spec)}.`);
                }
            });
        }

        // check whether there is a spec for all classifiers marked 'hasType'
        if (!!definition.conceptsWithType) {
            definition.conceptsWithType.forEach(con => {
                if (con instanceof FreMetaConcept && !con.isAbstract) {
                    let foundRule: FretInferenceRule | undefined = undefined;
                    // see if there is a spec for this concept with an infertype rule
                    this.findSpecsForConcept(con).forEach(spec => {
                        const rule: FretTypeRule | undefined = spec.rules.find(r => r instanceof FretInferenceRule);
                        if (!!rule) {
                            foundRule = rule as FretInferenceRule;
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

        // const phase2: FreTyperCheckerPhase2 = new FreTyperCheckerPhase2(this.language);
        // phase2.check(definition);
        // if (phase2.hasErrors()) {
        //     this.errors.push(...phase2.errors);
        // }
        // if (phase2.hasWarnings()) {
        //     this.warnings.push(...phase2.warnings);
        // }
    }

    private findSpecsForConcept(con: FreMetaConcept): FretClassifierSpec[] {
        const result: FretClassifierSpec[] = [];
        ListUtil.addIfNotPresent(result, this.definition.classifierSpecs.find(spec => spec.myClassifier === con));
        // try finding specs for a superclassifier
        const supers: FreMetaClassifier[] = LangUtil.superClassifiers(con);
        for (const super1 of supers) {
            ListUtil.addIfNotPresent(result, this.definition.classifierSpecs.find(spec => spec.myClassifier === super1));
        }
        return result;
    }

    private checkTypeReferences(types: MetaElementReference<FreMetaClassifier>[]) {
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

    private addInheritedClassifiers(types: FreMetaClassifier[]): FreMetaClassifier[] {
        // LOGGER.log("addInheritedConcepts to: '" + types.map(t => t.name).join(", ") + "'");
        const result: FreMetaClassifier[] = [];
        ListUtil.addListIfNotPresent<FreMetaClassifier>(result, types);
        if (!!types) {
            types.forEach((t: FreMetaClassifier) => {
                ListUtil.addListIfNotPresent<FreMetaClassifier>(result, LangUtil.findAllImplementorsAndSubs(t));
            });
        }
        return result;
    }

    private checkAnyTypeRule(spec: FretAnyTypeSpec) {
        // LOGGER.log("Checking anyTypeSpec '" + spec.toFreString() + "'");
        spec.rules.forEach(rule => {
            // check the rule, using the overall model as enclosing concept
            this.checkTypeRule(rule, this.language.modelConcept);
        });
    }

    private checkClassifierSpec(spec: FretClassifierSpec) {
        CommonChecker.checkClassifierReference(spec.$myClassifier, this.runner);
        if (!!spec.myClassifier) {
            spec.rules.forEach(rule => {
                // check the rule, using the overall model as enclosing concept
                this.checkTypeRule(rule, spec.myClassifier!);
            });
        }
    }

    private checkTypeRule(rule: FretTypeRule, enclosingConcept: FreMetaClassifier) {
        if (rule instanceof FretInferenceRule) {
            this.checkInferenceRule(rule, enclosingConcept);
        } else if (rule instanceof FretConformanceRule) {
            this.checkConformanceRule(rule, enclosingConcept);
        } else if (rule instanceof FretEqualsRule) {
            this.checkEqualsRule(rule, enclosingConcept);
        } else if (rule instanceof FretLimitedRule) {
            this.checkLimitedRule(rule, enclosingConcept);
        }
        this.checkFretExp(rule.exp, enclosingConcept);
        if (!!rule.exp.returnType) { // errormessage already provided
            rule.returnType = rule.exp.returnType;
        }
    }

    private checkInferenceRule(rule: FretInferenceRule, enclosingConcept: FreMetaClassifier) {
        this.runner.simpleCheck(enclosingConcept !== this.language.modelConcept,
            `'Anytype' cannot have an infertype rule ${ParseLocationUtil.location(rule)}.`);
        this.runner.simpleCheck(this.definition.conceptsWithType.includes(enclosingConcept),
            `Concept or interface '${enclosingConcept.name}' is not marked 'hastype', therefore it cannot have an infertype rule ${ParseLocationUtil.location(rule)}.`);
        this.runner.simpleCheck(!(rule.exp instanceof FretWhereExp), `A 'where' expression may not be used in an 'infertype' rule, please use 'Concept {...}' ${ParseLocationUtil.location(rule)}.`);
        // rule.exp = this.changeInstanceToPropCallExp(rule.exp, enclosingConcept);
    }

    private checkConformanceRule(rule: FretConformanceRule, enclosingConcept: FreMetaClassifier) {
        if (enclosingConcept !== this.language.modelConcept) {
            this.runner.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have a conformance rule ${ParseLocationUtil.location(rule)}.`);
        }
    }

    private isMarkedIsType(enclosingConcept: FreMetaClassifier): boolean {
        let isTypeConcept: boolean = this.definition.types.includes(enclosingConcept);
        if (!isTypeConcept && enclosingConcept instanceof FretTypeConcept) {
            isTypeConcept = this.definition.typeConcepts.includes(enclosingConcept);
        }
        return isTypeConcept;
    }

    private checkEqualsRule(rule: FretEqualsRule, enclosingConcept: FreMetaClassifier) {
        if (enclosingConcept !== this.language.modelConcept) {
            this.runner.simpleCheck(this.isMarkedIsType(enclosingConcept),
                `Concept or interface '${enclosingConcept.name}' is not marked 'istype', therefore it cannot have an equals rule ${ParseLocationUtil.location(rule)}.`);
        }
    }

    private checkLimitedRule(rule: FretLimitedRule, enclosingConcept: FreMetaClassifier) {
        // LOGGER.log("Checking limited rule '" + rule.toFreString() + "' for " + enclosingConcept.name );
        this.runner.simpleCheck(enclosingConcept instanceof FreMetaLimitedConcept,
            `This type of rule may only be used for limited concepts ${ParseLocationUtil.location(rule)}.`);
        // remedy possible parse error, TODO find better solution
        if (rule.exp instanceof FretBinaryExp) {
            if (rule.exp.left instanceof FretVarCallExp) {
                rule.exp.left = this.changeVarCallIntoInstanceExp(rule.exp.left);
            }
            if (rule.exp.right instanceof FretVarCallExp) {
                rule.exp.right = this.changeVarCallIntoInstanceExp(rule.exp.right);
            }
        }
    }

    private changeVarCallIntoInstanceExp(myVarCall: FretVarCallExp): FretLimitedInstanceExp {
        const result: FretLimitedInstanceExp = new FretLimitedInstanceExp();
        result.owner = myVarCall.owner;
        result.$myInstance = MetaElementReference.create<FreMetaInstance>(myVarCall.$variable.name, "FreInstance");
        result.$myInstance.owner = result;
        result.aglParseLocation = myVarCall.aglParseLocation;
        return result;
    }

    private checkFretExp(exp: FretExp, enclosingConcept: FreMetaClassifier, surroundingExp?: FretWhereExp, surroundingAllowed?: boolean) {
        // console.log("Checking FretExp '" + exp.toFreString() + "'");
        exp.language = this.language;
        if (exp instanceof FretAnytypeExp ) {
            // nothing to check
            exp.returnType = FreMetaClassifier.ANY;
        } else if (exp instanceof FretBinaryExp) {
            this.checkBinaryExp(exp, enclosingConcept, surroundingExp);
            exp.returnType = FreMetaPrimitiveType.boolean;
        } else if (exp instanceof FretCreateExp) {
            this.checkCreateExp(exp, enclosingConcept);
            exp.returnType = exp.type;
        } else if (exp instanceof FretFunctionCallExp) {
            this.checkFunctionCallExpression(exp, enclosingConcept, surroundingExp);
        } else if (exp instanceof FretLimitedInstanceExp) {
            this.checkInstanceExp(exp, enclosingConcept);
            exp.returnType = exp.myLimited;
        } else if (exp instanceof FretPropertyCallExp ) {
            this.checkPropertyCallExp(exp, enclosingConcept, surroundingExp, surroundingAllowed);
        } else if (exp instanceof FretSelfExp) {
            // nothing to check
            exp.returnType = enclosingConcept;
        } else if (exp instanceof FretVarCallExp) {
            this.checkVarCallExp(exp);
        } else if (exp instanceof FretWhereExp) {
            this.checkWhereExp(exp, enclosingConcept);
        }
    }

    private checkBinaryExp(exp: FretBinaryExp, enclosingConcept: FreMetaClassifier, surroundingExp?: FretWhereExp) {
        // LOGGER.log("Checking FretBinaryExp '" + exp.toFreString() + "'");
        this.checkFretExp(exp.left, enclosingConcept, surroundingExp);
        this.checkFretExp(exp.right, enclosingConcept, surroundingExp);
    }

    private checkCreateExp(exp: FretCreateExp, classifier: FreMetaClassifier, surroundingExp?: FretWhereExp) {
        // LOGGER.log("Checking FretCreateExp '" + exp.toFreString() + "'");
        this.checkTypeReference(exp.$type, false);
        // console.log("TYPE of Create: " + exp.__type.name + ", " + exp.__type.owner + ", " + exp.type?.name);
        // this.myExpressionthis.runner.checkClassifierReference(exp.__type);
        // console.log("TYPE: " + exp.type?.name + " with props: " + exp.type?.allProperties().map(p => p.name).join(", "))
        exp.propertyDefs.forEach(propDef => {
            this.checkFretExp(propDef.value, classifier, surroundingExp);
            this.runner.nestedCheck({
                check: !!propDef.property,
                error: `Cannot find property '${propDef.$property.name}' ${ParseLocationUtil.location(propDef.$property)}.`,
                whenOk: () => {
                    const propType: FreMetaClassifier = propDef.property!.type;
                    const valueType: FreMetaClassifier | undefined = propDef.value.returnType;
                    let doesConform: boolean = false;
                    this.runner.nestedCheck( {
                        check: !!valueType,
                        error: `Checking against unknown value type (TODO: better message), ${ParseLocationUtil.location(propDef.$property)}.`,
                        whenOk: () => {
                            if (propType !== TyperDef.freonType) {
                                const typeCheck: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType([propType, valueType!]);
                                doesConform = typeCheck.length > 0 && typeCheck[0] === propType;
                            } else {
                                // valueType conforms to FreType if
                                if (valueType === TyperDef.freonType) { // (0) it is equal to FreType
                                    doesConform = true;
                                } else if (valueType instanceof FretTypeConcept) { // (1) it is a TypeConcept, or
                                    doesConform = this.definition.typeConcepts.includes(valueType);
                                } else { // (2) it is marked 'isType'
                                    doesConform = this.definition.types.includes(valueType!);
                                }
                            }
                        }
                    });
                    this.runner.simpleCheck(doesConform,
                        `Type of '${propDef.value.toFreString()}' (${valueType?.name}) does not conform to ${propType?.name} ${ParseLocationUtil.location(propDef)}.`);
                }
            });
        });
    }

    private checkWhereExp(exp: FretWhereExp, classifier: FreMetaClassifier) {
        // LOGGER.log("Checking FretWhereExp '" + exp.toFreString() + "'");
        this.runner.nestedCheck({
            check: !!exp.variable.type,
            error: `Cannot find type '${exp.variable.$type.name}' ${ParseLocationUtil.location(exp.variable.$type)}.`,
            whenOk: () => {
                // check all conditions of the where expression
                exp.conditions.forEach(cond => {
                    this.checkBinaryExp(cond, classifier, exp);
                });
                exp.returnType = exp.variable.type;
            }
        });
    }

    private checkInstanceExp(exp: FretLimitedInstanceExp, classifier: FreMetaClassifier) {
        if (!!exp.$myLimited) {
            this.runner.simpleCheck(
                !!exp.myLimited,
                `Cannot find limited concept '${exp.$myLimited.name}' ${ParseLocationUtil.location(exp.$myLimited)}.`);
        } else {
            // use the enclosing classifier as limited concept
            if (classifier instanceof FreMetaLimitedConcept) {
                exp.myLimited = classifier;
            }
        }
        this.runner.simpleCheck(!!exp.myLimited, `Cannot find limited concept or enclosing classifier ${ParseLocationUtil.location(exp)}.`);
        if (!!exp.myLimited) {
            this.runner.nestedCheck({
                check: !!exp.myInstance,
                error: `Cannot find instance '${exp.$myInstance.name}' of '${exp.$myLimited?.name}' ${ParseLocationUtil.location(exp.$myInstance)}.`,
                whenOk: () => {
                    this.runner.simpleCheck(!!exp.myLimited!.findInstance(exp.$myInstance.name),
                        `Instance '${exp.$myInstance.name}' is not of type '${exp.$myLimited!.name}' ${ParseLocationUtil.location(exp.$myInstance)}.`);
                }
            });
        }
    }

    private checkPropertyCallExp(exp: FretPropertyCallExp, enclosingConcept: FreMetaClassifier, surroundingExp?: FretWhereExp, surroundingAllowed?: boolean) {
        // console.log("Checking FretPropertyCallExp '" + exp.toFreString() + "'");
        if (!!exp.source) {
            this.checkFretExp(exp.source, enclosingConcept, surroundingExp, surroundingAllowed);
            // console.log("found source: " + exp.source.toFreString() + " of type " + exp.source.returnType.name);
            this.runner.nestedCheck({
                check: !!exp.property,
                error: `Cannot find property '${exp.$property.name}' in classifier '${exp.source.returnType?.name}' ${ParseLocationUtil.location(exp.$property)}.`,
                whenOk: () => {
                    exp.returnType = exp.property!.type;
                }
            });
        }
    }

    private checkVarCallExp(exp: FretVarCallExp) {
        // LOGGER.log("Checking checkVarCallExp '" + exp.toFreString() + "'");
        this.runner.nestedCheck({
            check: !!exp.variable,
            error: `Cannot find reference to ${exp.$variable.name} ${ParseLocationUtil.location(exp.$variable)}.`,
            whenOk: () => {
                exp.returnType = exp.variable?.type;
            }
        });
    }

    private checkFunctionCallExpression(exp: FretFunctionCallExp, enclosingConcept: FreMetaClassifier, surroundingExp?: FretWhereExp) {
        // LOGGER.log("checkFunctionCallExpression " + exp?.toFreString());

        const functionName: string | undefined = validFunctionNames.find(name => name === exp.calledFunction);
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
                            exp.returnType = TyperDef.freonType;
                        }
                    });
                } else if (exp.calledFunction === validFunctionNames[1]) { // "commonSuperType"
                    this.runner.nestedCheck({
                        check: exp.actualParameters.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${exp.actualParameters.length} ${ParseLocationUtil.location(exp)}.`,
                        whenOk: () => {
                            this.checkArguments(exp, enclosingConcept, surroundingExp);
                            exp.returnType = TyperDef.freonType;
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

    private checkArguments(langExp: FretFunctionCallExp, enclosingConcept: FreMetaClassifier, surroundingExp?: FretWhereExp) {
        langExp.actualParameters.forEach(p => {
                this.checkFretExp(p, enclosingConcept, surroundingExp, false);
            }
        );
    }

    private checkTypeConcepts(typeConcepts: FretTypeConcept[]) {
        const names: string[] = [];
        for (const typeConcept of typeConcepts) {
            // (1) name may not be equal to any of the classifiers in the AST
            const foundASTconcept = this.language.conceptsAndInterfaces().find(c => c.name === typeConcept.name);
            this.runner.simpleCheck(
                !foundASTconcept,
                `Name of type concept (${typeConcept.name}) may not be equal to a concept or interface in the structure definition (.ast) ${ParseLocationUtil.location(typeConcept)}.`
            );
            this.runner.simpleCheck(!(freReservedWords.includes(typeConcept.name.toLowerCase())), `Concept may not have a name that is equal to a reserved word ('${typeConcept.name}') ${ParseLocationUtil.location(typeConcept)}.`);
            this.runner.simpleCheck(!(reservedWordsInTypescript.includes(typeConcept.name.toLowerCase())),
                // tslint:disable-next-line:max-line-length
                `Concept may not have a name that is equal to a reserved word in TypeScript ('${typeConcept.name}') ${ParseLocationUtil.location(typeConcept)}.`);

            // (2) name must be unique within the list 'typeConcepts'
            if (names.includes(typeConcept.name)) {
                this.runner.simpleCheck(false,
                    `Type concept with name '${typeConcept.name}' already exists ${ParseLocationUtil.location(typeConcept)}.`);
            } else {
                names.push(Names.startWithUpperCase(typeConcept.name));
                names.push(typeConcept.name);
            }
            // (3) base concept, if present, must be known within 'typeConcepts'
            if (!!typeConcept.base) {
                this.checkTypeReference(typeConcept.base, true);
            }

            // check the properties
            typeConcept.properties.forEach(part => this.checkTypeConceptProperty(part, typeConcept));
        }
    }

    private checkTypeConceptProperty(freProperty: FreMetaProperty, fretTypeConcept: FretTypeConcept): void {
        // LOGGER.log("Checking type concept property '" + freProperty.name + "'");
        // set all unused properties of this class
        freProperty.isOptional = false;
        freProperty.isPart = true;
        freProperty.isList = false;
        freProperty.isPublic = false;
        //
        freProperty.owningClassifier = fretTypeConcept;
        this.runner.simpleCheck(!(reservedWordsInTypescript.includes(freProperty.name.toLowerCase())),
            `Property may not have a name that is equal to a reserved word in TypeScript ('${freProperty.name}') ${ParseLocationUtil.location(freProperty)}.`);
        // (4) the types of the properties must be known, either as classifiers in the AST,
        //      or as type concepts
        if (freProperty instanceof FretProperty) {
            this.checkTypeReference(freProperty.typeReference, false);
        } else {
            CommonChecker.checkClassifierReference(freProperty.typeReference, this.runner);
        }
        // the following checks are done in phase2
        // (5) property names must be unique within one concept
        // (6) check inherited props on rules layed out in languagedef checker
    }

    private checkTypeReference(refType: MetaElementReference<FreMetaClassifier>, typeConceptRequired: boolean) {
        this.runner.nestedCheck({
            check: !!refType.referred,
            error: `Cannot find reference to ${refType.name} ${ParseLocationUtil.location(refType)}.`,
            whenOk: () => {
                if (typeConceptRequired) {
                    this.runner.simpleCheck(refType.referred instanceof FretTypeConcept, `Only type concepts allowed ${ParseLocationUtil.location(refType)}.`);
                }
            }
        });
    }
}
