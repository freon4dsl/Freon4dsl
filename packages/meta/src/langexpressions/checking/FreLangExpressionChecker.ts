import { Names } from '../../utils/on-lang/index.js';
import { MetaLogger, MetaFunctionNames } from '../../utils/no-dependencies/index.js';
import { Checker, CheckRunner, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import type { LanguageExpressionTester, TestExpressionsForConcept } from "../parser/LanguageExpressionTester.js";
import type {
    FreMetaLanguage,
    FreMetaClassifier} from '../../languagedef/metalanguage/index.js';
import {
    FreMetaLimitedConcept,
    FreMetaUnitDescription,
    LangUtil
} from '../../languagedef/metalanguage/index.js';
import type {
    FreLangExp} from '../metalanguage/index.js';
import {
    FreFunctionExp,
    FreLangSimpleExp,
    FreLimitedInstanceExp,
    FreVarExp
} from '../metalanguage/index.js';
import { ReferenceResolver } from '../../languagedef/checking/ReferenceResolver.js';
import { isNullOrUndefined } from '../../utils/file-utils/index.js';

const LOGGER = new MetaLogger("FreLangExpressionChecker").mute();

export class FreLangExpressionChecker extends Checker<LanguageExpressionTester> {
    strictUseOfSelf: boolean = true; // if true, then a FreSelfExp must have an applied expression
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);

    constructor(language: FreMetaLanguage | undefined) {
        super(language);
    }

    /**
     * This method is only used in tests. It checks a complete 'LanguageExpressionTester'.
     * Runtime, the method 'checkLangExp' is used to check a single expression that occurs for instance in a scope or valid file.
     * @param definition
     */
    public check(definition: LanguageExpressionTester): void {
        LOGGER.log("Checking test expressions");
        // Because a rerun of the parser removes the errors and warnings, we create a new runner instance.
        this.runner = new CheckRunner(this.errors, this.warnings);
        if (isNullOrUndefined(this.language)) {
            throw new Error(
                `Expression Tester definition checker does not known the language, exiting ` +
                    `${ParseLocationUtil.location(definition)}.`,
            );
        }
        this.runner.nestedCheck({
            // TODO We need to test on the language, when we add language composition.
            check: true, //this.language.name === definition.languageName,
            error:
                `Language reference ('${definition.languageName}') in Test expression checker does not match language '${this.language.name}' ` +
                `${ParseLocationUtil.location(definition)}.`,
            whenOk: () => {
                definition.language = this.language!;
                definition.conceptExps.forEach((rule) => {
                    // rule.language = this.language;
                    this.checkLangExpSet(rule);
                });
            },
        });
    }

    // ConceptName { exp exp exp }
    // Again this method is only used in tests.
    private checkLangExpSet(rule: TestExpressionsForConcept) {
        LOGGER.log("checkLangSetExp " + rule.toFreString());
        ReferenceResolver.resolveClassifierReference(rule.classifierRef, this.runner, this.language!);

        const enclosingConcept = rule.classifierRef?.referred;
        if (!!enclosingConcept) {
            rule.exps.forEach((tr) => {
                // tr.language = this.language;
                this.checkLangExp(tr, enclosingConcept, this.runner);
            });
        }
    }

    // exp
    public checkLangExp(langExp: FreLangExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        LOGGER.log("checkLangExp " + langExp.toFreString());
        if (!enclosingConcept) {
            LOGGER.error("enclosingConcept is null in 'checkLangExp'.");
            return;
        }
        // the following statement is needed to be able to resolve references to the metamodel
        langExp.language = this.language!;
        if (langExp instanceof FreLimitedInstanceExp) {
            this.checkInstanceExpression(langExp, runner);
        } else if (langExp instanceof FreVarExp) {
            this.checkVarExp(langExp, enclosingConcept, runner);
        } else if (langExp instanceof FreFunctionExp) {
            this.checkFunctionExp(langExp, enclosingConcept, runner);
        } else if (langExp instanceof FreLangSimpleExp) {
            // no need to check a simple expression
        }
    }

    // parsed something of the form: #LimitedConcept:instanceName
    public checkInstanceExpression(langExp: FreLimitedInstanceExp, runner: CheckRunner) {
        LOGGER.log("checkInstanceExpression " + langExp?.toFreString());
        const myLimitedConcept = this.language!.findConcept(langExp.conceptName);

        runner.nestedCheck({
            check: !!myLimitedConcept,
            error: `Cannot find limited concept ${langExp.conceptName} ${ParseLocationUtil.location(langExp)}.`,
            whenOk: () => {
                runner.nestedCheck({
                    check: myLimitedConcept instanceof FreMetaLimitedConcept,
                    error: `Concept ${langExp.conceptName} does not defined any instances ${ParseLocationUtil.location(langExp)}.`,
                    whenOk: () => {
                        langExp.referredClassifier = myLimitedConcept!;
                        runner.nestedCheck({
                            check: !!langExp.instanceName,
                            error: `A limited concept expression should have an instance name ${ParseLocationUtil.location(langExp)}.`,
                            whenOk: () => {
                                const foundInstance = (myLimitedConcept as FreMetaLimitedConcept).instances.find(
                                  (l) => l.name === langExp.instanceName,
                                );
                                runner.simpleCheck(
                                  !!foundInstance,
                                  `Instance '${langExp.instanceName}' is not a predefined instance of ${myLimitedConcept!.name} ` +
                                  `${ParseLocationUtil.location(langExp)}.`,
                                );
                                if (!!foundInstance) {
                                    langExp.referredInstance = foundInstance;
                                }
                            },
                        });
                    },
                });
            },
        });
    }

    /**
     * Method used for any parsed identifier, which may be resolved to
     * (1) 'self', (2) a property, (3), the name of a classifier.
     * @param freVarExp
     * @param enclosingConcept
     * @param runner
     * @private
     */
    private checkVarExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        LOGGER.log("checkVarExp " + freVarExp?.toFreString() + " in " + enclosingConcept.name);
        if (freVarExp.name === Names.nameForSelf) {
            this.checkSelfExp(freVarExp, enclosingConcept, runner);
        } else {
            if (!freVarExp.previous) {
                // var may be a classifier
                this.tryToResolveAsClassifier(freVarExp);
                // no error yet!
                // if not a classifier, var should be known as property in enclosing concept
                if (!freVarExp.referredClassifier) { // indicates that 'var' could not be resolved as classifier
                    this.tryToResolveAsProperty(enclosingConcept, freVarExp, enclosingConcept, runner);
                }
            } else {
                // var may not be a classifier
                this.tryToResolveAsClassifier(freVarExp);
                runner.nestedCheck({
                    check: !freVarExp.referredClassifier,
                    error: `Classifier '${freVarExp.name}' may not be used after '.' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        // var should be known as property in meta type of previous
                        this.tryToResolveAsProperty(freVarExp.previous!.getLocalClassifier(), freVarExp, enclosingConcept, runner);
                    }
                })
            }
        }
    }

    private tryToResolveAsProperty(myContext: FreMetaClassifier | undefined, freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        // error message on 'undefined' context already given in checkAppliedExp() ???
        // todo if so, remove this check!
        runner.nestedCheck({
            check: !!myContext,
            error: `Cannot determine the context in which to resolve '${freVarExp.name}' ${ParseLocationUtil.location(freVarExp)}.`,
            whenOk: () => {
                for (const e of myContext!.allProperties()) {
                    if (e.name === freVarExp.name) {
                        freVarExp.referredProperty = e;
                        if (!!e.typeReference.referred) {
                            freVarExp.referredClassifier = e.typeReference.referred;
                        }
                    }
                }
                runner.nestedCheck({
                    check: !!freVarExp.referredProperty,
                    error: `Cannot find property '${freVarExp.name}' in classifier '${myContext!.name}' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        // check applied expression
                        this.checkAppliedExp(freVarExp, enclosingConcept, runner);
                    }
                });
            }
        })
    }

    private tryToResolveAsClassifier(freVarExp: FreVarExp) {
        if (!freVarExp.referredProperty) {
            const myClassifier = this.language?.classifiers().find(cls => cls.name === freVarExp.name);
            if (!!myClassifier) {
                freVarExp.referredClassifier = myClassifier;
            }
        }
    }

    private checkSelfExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        LOGGER.log("checkSelfExp " + freVarExp?.toFreString() + " in " + enclosingConcept?.name);
        freVarExp.referredClassifier = enclosingConcept;
        runner.nestedCheck({
            check: !freVarExp.previous,
            error: `'self' may only appear at the start of an expression ${ParseLocationUtil.location(freVarExp)}.`,
            whenOk: () => {
                if (this.strictUseOfSelf) {
                    runner.nestedCheck({
                        check: !!freVarExp.applied,
                        error: `'self' should be followed by '.', followed by a property ${ParseLocationUtil.location(freVarExp)}.`,
                        whenOk: () => {
                            // check applied expression
                            this.checkAppliedExp(freVarExp, enclosingConcept, runner);
                        }
                    });
                }
            }
        });
    }

    private checkFunctionExp(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        LOGGER.log("checkFunctionExp " + freFunctionExp?.toFreString() + " in " + enclosingConcept?.name);
        const functionName = MetaFunctionNames.allNames.find((name) => name === freFunctionExp.name);
        // name should be a valid meta function
        runner.nestedCheck({
            check: functionName !== undefined && functionName !== null,
            error: `'${freFunctionExp.name}' is not a valid function ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                // When this is the first in the applied expression chain, use the enclosing concept as context,
                // otherwise use the type of the previous expression.
                let myContext: FreMetaClassifier | undefined = enclosingConcept;
                if (!!freFunctionExp.previous) {
                    myContext = freFunctionExp.previous.getLocalClassifier();
                }
                // error message on 'undefined' context already given in checkAppliedExp()
                switch (freFunctionExp.name) {
                    // Possible values ["conformsTo", "equalsType", "type", "owner", "if"];
                    case MetaFunctionNames.conformsToFunc: { this.checkConformsFunction(freFunctionExp, enclosingConcept, myContext, runner); break;}
                    case MetaFunctionNames.equalsTypeFunc: { this.checkEqualsFunction(freFunctionExp, enclosingConcept, myContext, runner); break;}
                    case MetaFunctionNames.typeFunc: { this.checkTypeFunction(freFunctionExp, enclosingConcept, myContext, runner); break;}
                    case MetaFunctionNames.ownerFunc: { this.checkOwnerFunction(freFunctionExp, enclosingConcept, myContext, runner); break;}
                    case MetaFunctionNames.ifFunc: { this.checkIfFunction(freFunctionExp, enclosingConcept, myContext, runner); break;}
                }
            }
        });
    }

    private checkConformsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined, runner: CheckRunner) {
        LOGGER.log("checkConformsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        runner.nestedCheck({
            check: !!freFunctionExp.param,
            error: `Function '${freFunctionExp.name}()' should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                freFunctionExp.param!.language = freFunctionExp.language;
                this.checkLangExp(freFunctionExp.param!, enclosingConcept, runner);
            }
        })
    }

    private checkEqualsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined, runner: CheckRunner) {
        LOGGER.log("checkEqualsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        runner.nestedCheck({
            check: !!freFunctionExp.param,
            error: `Function '${freFunctionExp.name}()' should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                freFunctionExp.param!.language = freFunctionExp.language;
                this.checkLangExp(freFunctionExp.param!, enclosingConcept, runner);
            }
        })
    }

    private checkTypeFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined, runner: CheckRunner) {
        LOGGER.log("checkTypeFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        runner.nestedCheck({
            check: freFunctionExp.param === undefined || freFunctionExp.param === null,
            error: `Function '${freFunctionExp.name}()' may not have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                runner.simpleCheck(
                    !freFunctionExp.applied,
                    `A dot-expression is not allowed after '${MetaFunctionNames.typeFunc}()' ${ParseLocationUtil.location(freFunctionExp)}.`
                )
            }
        });
    }

    private checkOwnerFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined, runner: CheckRunner) {
        LOGGER.log("checkOwnerFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        runner.nestedCheck({
            check: freFunctionExp.param === undefined || freFunctionExp.param === null,
            error: `Function '${freFunctionExp.name}()' may not have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                if (!!myContext) { // error message given elsewhere
                    const owners: FreMetaClassifier[] = this.findPossibleOwnersOf(myContext);
                    // if possible, set the referredClassifier
                    if (owners.length === 1) {
                        freFunctionExp.referredClassifier = owners[0];
                    }
                    // always set the possible set of classifiers
                    freFunctionExp.possibleClassifiers = owners;
                }
                // check applied expression
                this.checkAppliedExp(freFunctionExp, enclosingConcept, runner);
            }
        });
    }

    private checkIfFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined, runner: CheckRunner) {
        LOGGER.log("checkIfFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        const param = freFunctionExp.param;
        runner.nestedCheck({
            check: param !== undefined && param !== null,
            error: `Function '${freFunctionExp.name}()' should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                // The parameter should refer to a classifier
                freFunctionExp.param!.language = freFunctionExp.language;
                if (freFunctionExp.param instanceof FreVarExp) {
                    this.tryToResolveAsClassifier(freFunctionExp.param);
                }
                const paramValue: FreMetaClassifier | undefined = freFunctionExp.param!.getResultingClassifier();
                // TODO extend this to include type() as param
                runner.nestedCheck({
                    check: !!paramValue,
                    error: `Parameter '${freFunctionExp.param!.toFreString()}' of '${freFunctionExp.name}()' should denote a classifier ${ParseLocationUtil.location(freFunctionExp)}.`,
                    whenOk: () => {
                        let possibleClassifiers: FreMetaClassifier[] = [];
                        // when previous is 'owner()', param may be any in the set of possible owners and their subtypes
                        // when previous is not 'owner()', param may be any of the subtypes of myContext, including myContext
                        const previous = freFunctionExp.previous;
                        if (!!previous && previous instanceof FreFunctionExp && previous.name === MetaFunctionNames.ownerFunc) {
                            possibleClassifiers = previous.possibleClassifiers;
                        } else {
                            if (!!myContext) { // error message is given elsewhere
                                possibleClassifiers = LangUtil.subClassifiers(myContext);
                            }
                        }
                        runner.nestedCheck({
                            check: possibleClassifiers.includes(paramValue!),
                            error: `Cannot limit to classifier '${paramValue!.name}', it is not a possible value ([${possibleClassifiers.map(xx => xx.name).join(", ")}]) ${ParseLocationUtil.location(freFunctionExp)}.`,
                            whenOk: () => {
                                // Set the resulting classifier
                                freFunctionExp.referredClassifier = paramValue!;
                                // check applied expression
                                this.checkAppliedExp(freFunctionExp, enclosingConcept, runner);
                            }
                        });
                    }
                });
            }
        })
    }

    private checkAppliedExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier, runner: CheckRunner) {
        if (!!freVarExp.applied) {
            freVarExp.applied!.language = freVarExp.language;
            this.checkLangExp(freVarExp.applied!, enclosingConcept, runner);
        }
    }

    private findPossibleOwnersOf(child: FreMetaClassifier): FreMetaClassifier[] {
        const foundOwners: Set<FreMetaClassifier> = new Set<FreMetaClassifier>();
        if (child instanceof FreMetaUnitDescription) {
            foundOwners.add(this.language!.modelConcept);
        } else {
            this.language?.classifiers().forEach(classifier => {
                classifier.allProperties().forEach(property => {
                    if (!!property.typeReference.referred) {
                        if (LangUtil.conforms(child, property.typeReference.referred)) {
                            foundOwners.add(classifier);
                            // add all its subtypes as well
                            LangUtil.subClassifiers(classifier).forEach(cls => {
                                foundOwners.add(cls);
                            });
                        }
                    }
                })
            });
        }
        return Array.from(foundOwners);
    }
}
