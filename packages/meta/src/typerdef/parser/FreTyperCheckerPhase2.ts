import { CheckerPhase, CheckRunner, ListUtil, ParseLocationUtil } from "../../utils";
import {
    FretAnytypeExp,
    FretBinaryExp, FretConformsExp,
    FretCreateExp, FretEqualsExp,
    FretExp,
    FretFunctionCallExp,
    FretLimitedInstanceExp, FretPropertyCallExp, FretSelfExp, FretVarCallExp, FretVarDecl,
    FretWhereExp,
    TyperDef
} from "../metalanguage";
import { ClassifierChecker } from "../../languagedef/checking/ClassifierChecker";
import { FreMetaProperty } from "../../languagedef/metalanguage";

// const LOGGER = new MetaLogger("FreTyperCheckerPhase2"); //.mute();

export class FreTyperCheckerPhase2 extends CheckerPhase<TyperDef> {
    definition: TyperDef;
    runner: CheckRunner;

    public check(definition: TyperDef, runner: CheckRunner): void {
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

    private checkTypeConcepts(definition: TyperDef) {
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

    private checkAllWhereExps(definition: TyperDef) {
        // run through the definition and check all where expressions
        if (!!definition.anyTypeSpec) {
            definition.anyTypeSpec.rules.forEach(rule => {
                // check the rule, using the overall model as enclosing concept
                this.checkFretExp(rule.exp);
            });
        }
        if (!!definition.classifierSpecs) {
            definition.classifierSpecs.forEach(spec => {
                spec.rules.forEach(rule => {
                    // check the rule, using the overall model as enclosing concept
                    this.checkFretExp(rule.exp);
                });
            });
        }
    }

    private checkFretExp(exp: FretExp) {
        // console.log("Checking FretExp '" + exp.toFreString() + "'");
        exp.language = this.language;
        if (exp instanceof FretAnytypeExp ) {
            // nothing to check
        } else if (exp instanceof FretBinaryExp) {
            this.checkBinaryExp(exp);
        } else if (exp instanceof FretCreateExp) {
            this.checkCreateExp(exp);
        } else if (exp instanceof FretFunctionCallExp) {
            this.checkFunctionCallExpression(exp);
        } else if (exp instanceof FretLimitedInstanceExp) {
            // nothing to check
        } else if (exp instanceof FretPropertyCallExp ) {
            this.checkPropertyCallExp(exp);
        } else if (exp instanceof FretSelfExp) {
            // nothing to check
        } else if (exp instanceof FretVarCallExp) {
            this.checkVarCallExp(exp);
        } else if (exp instanceof FretWhereExp) {
            this.checkWhereExp(exp);
        }
    }

    private checkBinaryExp(exp: FretBinaryExp) {
        // LOGGER.log("Checking FretBinaryExp '" + exp.toFreString() + "'");
        this.checkFretExp(exp.left);
        this.checkFretExp(exp.right);
    }

    private checkCreateExp(exp: FretCreateExp) {
        // LOGGER.log("Checking FretCreateExp '" + exp.toFreString() + "'");
        exp.propertyDefs.forEach(propDef => {
            this.checkFretExp(propDef.value);
        });
    }

    private checkPropertyCallExp(exp: FretPropertyCallExp) {
        // console.log("Checking FretPropertyCallExp '" + exp.toFreString() + "'");
        if (!!exp.source) {
            this.checkFretExp(exp.source);
        }
    }

    private checkVarCallExp(exp: FretVarCallExp) {
        // LOGGER.log("Checking checkVarCallExp '" + exp.toFreString() + "'");
        this.runner.nestedCheck({
            check: !!exp.variable,
            error: `Cannot find reference to ${exp.$variable.name} ${ParseLocationUtil.location(exp.$variable)}.`,
            whenOk: () => {
                exp.returnType = exp.variable.type;
            }
        });
    }

    private checkFunctionCallExpression(exp: FretFunctionCallExp) {
        // LOGGER.log("checkFunctionCallExpression " + exp?.toFreString());
        exp.actualParameters.forEach(p => {
                this.checkFretExp(p);
            }
        );
    }

    private checkWhereExp(exp: FretWhereExp) {
        // sort the conditions such that the part that refers to the extra variable is always the left,
        // and check the uniqueness of the properties of the variable in the conditions
        exp.conditions = this.sortConditions(exp.conditions, exp.variable);
    }

    private sortConditions(conditions: FretBinaryExp[], variable: FretVarDecl): FretBinaryExp[] {
        const result: FretBinaryExp[] = [];
        const properties: FreMetaProperty[] = [];
        conditions.forEach(cond => {
            // find out which part of the condition refers to 'variable'
            let variablePart: FretExp;
            let knownTypePart: FretExp;
            let baseSource = cond.left.baseSource();
            if (baseSource instanceof FretVarCallExp && baseSource.variable === variable) {
                variablePart = cond.left;
                knownTypePart = cond.right;
            } else {
                baseSource = cond.right.baseSource();
                if (baseSource instanceof FretVarCallExp && baseSource.variable === variable) {
                    variablePart = cond.right;
                    knownTypePart = cond.left;
                }
            }
            this.checkUniquenessOfProperty(variablePart, properties);
            // return a new condition with the knownTypePart always as the right
            if (cond instanceof FretEqualsExp) {
                result.push(FretEqualsExp.create({ left: variablePart, right: knownTypePart }));
            } else if (cond instanceof FretConformsExp) {
                result.push(FretConformsExp.create({ left: variablePart, right: knownTypePart }));
            }
        });
        return result;
    }

    private checkUniquenessOfProperty(variablePart: FretExp, properties: FreMetaProperty[]) {
        if (!!variablePart && variablePart instanceof FretPropertyCallExp) {
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
