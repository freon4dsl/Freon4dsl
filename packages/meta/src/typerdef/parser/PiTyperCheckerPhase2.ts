import { CheckerPhase, CheckRunner, ListUtil, ParseLocationUtil } from "../../utils";
import {
    PitAnytypeExp,
    PitBinaryExp, PitConformsExp,
    PitCreateExp, PitEqualsExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp, PitPropertyCallExp, PitSelfExp, PitVarCallExp, PitVarDecl,
    PitWhereExp,
    PiTyperDef
} from "../metalanguage";
import { ClassifierChecker } from "../../languagedef/checking/ClassifierChecker";
import { FreProperty } from "../../languagedef/metalanguage";

// const LOGGER = new MetaLogger("PiTyperCheckerPhase2"); //.mute();

export class PiTyperCheckerPhase2 extends CheckerPhase<PiTyperDef> {
    definition: PiTyperDef;
    runner: CheckRunner;

    public check(definition: PiTyperDef, runner: CheckRunner): void {
        // LOGGER.log("Checking typer definition phase 2");
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        this.runner = runner;

        if (this.language === null || this.language === undefined) {
            throw new Error(`Typer checker does not known the language.`);
        }
        // TODO test this
        this.checkTypeConcepts(definition);
        this.checkAllWhereExps(definition);
    }

    private checkTypeConcepts(definition: PiTyperDef) {
        const names: string[] = [];
        const classifierChecker = new ClassifierChecker();
        let foundSomeCircularity: boolean = false;
        definition.typeConcepts.forEach(typeConcept => {
            if (classifierChecker.checkClassifier(names, typeConcept, this.runner)) {
                foundSomeCircularity = true;
            }
        });
        if (!foundSomeCircularity) {
            // check if there are no infinite loops in the model, i.e.
            // A has part b: B and B has part a: A and both are mandatory
            // Note: this can be done only after checking for circular inheritance, because we need to look at allParts.
            definition.typeConcepts.forEach(typeConcept => {
                classifierChecker.checkInfiniteLoops(typeConcept, this.runner);
            });
        }
    }

    private checkAllWhereExps(definition: PiTyperDef) {
        // run through the definition and check all where expressions
        if (!!definition.anyTypeSpec) {
            definition.anyTypeSpec.rules.forEach(rule => {
                // check the rule, using the overall model as enclosing concept
                this.checkPitExp(rule.exp);
            });
        }
        if (!!definition.classifierSpecs) {
            definition.classifierSpecs.forEach(spec => {
                spec.rules.forEach(rule => {
                    // check the rule, using the overall model as enclosing concept
                    this.checkPitExp(rule.exp);
                });
            });
        }        
    }

    private checkPitExp(exp: PitExp) {
        // console.log("Checking PitExp '" + exp.toPiString() + "'");
        exp.language = this.language;
        if (exp instanceof PitAnytypeExp ) {
            // nothing to check
        } else if (exp instanceof PitBinaryExp) {
            this.checkBinaryExp(exp);
        } else if (exp instanceof PitCreateExp) {
            this.checkCreateExp(exp);
        } else if (exp instanceof PitFunctionCallExp) {
            this.checkFunctionCallExpression(exp);
        } else if (exp instanceof PitLimitedInstanceExp) {
            // nothing to check
        } else if (exp instanceof PitPropertyCallExp ) {
            this.checkPropertyCallExp(exp);
        } else if (exp instanceof PitSelfExp) {
            // nothing to check
        } else if (exp instanceof PitVarCallExp) {
            this.checkVarCallExp(exp);
        } else if (exp instanceof PitWhereExp) {
            this.checkWhereExp(exp);
        }
    }

    private checkBinaryExp(exp: PitBinaryExp) {
        // LOGGER.log("Checking PitBinaryExp '" + exp.toPiString() + "'");
        this.checkPitExp(exp.left);
        this.checkPitExp(exp.right);
    }

    private checkCreateExp(exp: PitCreateExp) {
        // LOGGER.log("Checking PitCreateExp '" + exp.toPiString() + "'");
        exp.propertyDefs.forEach(propDef => {
            this.checkPitExp(propDef.value);
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp) {
        // console.log("Checking PitPropertyCallExp '" + exp.toPiString() + "'");
        if (!!exp.source) {
            this.checkPitExp(exp.source);
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

    private checkFunctionCallExpression(exp: PitFunctionCallExp) {
        // LOGGER.log("checkFunctionCallExpression " + exp?.toPiString());
        exp.actualParameters.forEach(p => {
                this.checkPitExp(p);
            }
        );
    }
    
    private checkWhereExp(exp: PitWhereExp) {
        // sort the conditions such that the part that refers to the extra variable is always the left,
        // and check the uniqueness of the properties of the variable in the conditions
        exp.conditions = this.sortConditions(exp.conditions, exp.variable);
    }

    private sortConditions(conditions: PitBinaryExp[], variable: PitVarDecl): PitBinaryExp[] {
        const result: PitBinaryExp[] = [];
        const properties: FreProperty[] = [];
        conditions.forEach(cond => {
            // find out which part of the condition refers to 'variable'
            let variablePart: PitExp;
            let knownTypePart: PitExp;
            let baseSource = cond.left.baseSource();
            if (baseSource instanceof PitVarCallExp && baseSource.variable === variable) {
                variablePart = cond.left;
                knownTypePart = cond.right;
            } else {
                baseSource = cond.right.baseSource();
                if (baseSource instanceof PitVarCallExp && baseSource.variable === variable) {
                    variablePart = cond.right;
                    knownTypePart = cond.left;
                }
            }
            this.checkUniquenessOfProperty(variablePart, properties);
            // return a new condition with the knownTypePart always as the right
            if (cond instanceof PitEqualsExp) {
                result.push(PitEqualsExp.create({left: variablePart, right: knownTypePart}));
            } else if (cond instanceof PitConformsExp) {
                result.push(PitConformsExp.create({left: variablePart, right: knownTypePart}));
            }
        });
        return result;
    }

    private checkUniquenessOfProperty(variablePart: PitExp, properties: FreProperty[]) {
        if (!!variablePart && variablePart instanceof PitPropertyCallExp) {
            if (properties.includes(variablePart.property)) {
                this.runner.simpleCheck(false,
                    `Property may not be present twice ${ParseLocationUtil.location(variablePart)}.`);
            } else {
                // console.log(`FOUND ${variablePart.property?.name} at ${ParseLocationUtil.location(variablePart)}`)
                ListUtil.addIfNotPresent(properties, variablePart.property);
            }
        }
    }
}
