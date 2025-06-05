import { Checker, MetaLogger, CheckRunner, ParseLocationUtil, Names, LangUtil } from '../../utils/index.js';
import { LanguageExpressionTesterNew, TestExpressionsForConcept } from "../parser/LanguageExpressionTesterNew.js";
import {
    FreMetaLanguage,
    FreMetaClassifier,
    FreMetaLimitedConcept,
    FreMetaEnvironment,
} from '../../languagedef/metalanguage/index.js';
import { CommonChecker } from '../../languagedef/checking/index.js';
import {
    FreAppliedExp, FreFunctionExp,
    FreLangExpNew, FreLangSimpleExp,
    FreLimitedInstanceExp, FreVarExp
} from '../metalanguage/FreLangExpressionsNew.js';

//@ts-ignore
const LOGGER = new MetaLogger("FreLangExpressionChecker").mute();
//@ts-ignore
const validFunctionNames: string[] = ["conformsTo", "equalsType", "type", "owner", "if"];

export class FreLangExpressionCheckerNew extends Checker<LanguageExpressionTesterNew> {
    strictUseOfSelf: boolean = true; // if true, then a FreSelfExp must have an applied expression
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);

    constructor(language: FreMetaLanguage | undefined) {
        super(language);
    }

    public check(definition: LanguageExpressionTesterNew): void {
        LOGGER.log("Checking test expressions");
        // Because a rerun of the parser removes the errors and warnings, we create a new runner instance.
        this.runner = new CheckRunner(this.errors, this.warnings);
        if (this.language === null || this.language === undefined) {
            throw new Error(
                `Expression Tester definition checker does not known the language, exiting ` +
                    `${ParseLocationUtil.location(definition)}.`,
            );
        }
        // Note: this should be done first, otherwise the references will not be resolved
        FreMetaEnvironment.metascoper.language = this.language;
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
    private checkLangExpSet(rule: TestExpressionsForConcept) {
        LOGGER.log("checkLangSetExp");
        CommonChecker.checkClassifierReference(rule.conceptRef, this.runner);

        const enclosingConcept = rule.conceptRef.referred;
        if (!!enclosingConcept) {
            rule.exps.forEach((tr) => {
                // tr.language = this.language;
                this.checkLangExp(tr, enclosingConcept);
            });
        }
    }

    // exp
    public checkLangExp(langExp: FreLangExpNew, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkLangExp " + langExp.toFreString());
        if (!enclosingConcept) {
            LOGGER.error("enclosingConcept is null in 'checkLangExp'.");
            return;
        }
        // the following statement is needed to be able to resolve references to the metamodel
        langExp.language = this.language!;
        if (langExp instanceof FreLimitedInstanceExp) {
            this.checkInstanceExpression(langExp);
        } else if (langExp instanceof FreVarExp) {
            this.checkVarExp(langExp, enclosingConcept);
        } else if (langExp instanceof FreFunctionExp) {
            this.checkFunctionExp(langExp, enclosingConcept);
        } else if (langExp instanceof FreLangSimpleExp) {
            // no need to check a simple expression
        }
    }

    // parsed something of the form: #LimitedConcept:instanceName
    public checkInstanceExpression(langExp: FreLimitedInstanceExp) {
        LOGGER.log("checkInstanceExpression " + langExp?.toFreString());
        const myLimitedConcept = this.language!.findConcept(langExp.conceptName);

        this.runner.nestedCheck({
            check: !!myLimitedConcept,
            error: `Cannot find limited concept ${langExp.conceptName} ${ParseLocationUtil.location(langExp)}.`,
            whenOk: () => {
                this.runner.nestedCheck({
                    check: myLimitedConcept instanceof FreMetaLimitedConcept,
                    error: `Concept ${langExp.conceptName} does not defined any instances ${ParseLocationUtil.location(langExp)}.`,
                    whenOk: () => {
                        langExp.referredClassifier = myLimitedConcept!;
                        this.runner.nestedCheck({
                            check: !!langExp.instanceName,
                            error: `A limited concept expression should have an instance name ${ParseLocationUtil.location(langExp)}.`,
                            whenOk: () => {
                                const foundInstance = (myLimitedConcept as FreMetaLimitedConcept).instances.find(
                                  (l) => l.name === langExp.instanceName,
                                );
                                this.runner.simpleCheck(
                                  !!foundInstance,
                                  `${langExp.instanceName} is not a predefined instance of ${myLimitedConcept!.name} ` +
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

    private checkVarExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkVarExp " + freVarExp?.toFreString() + " in " + enclosingConcept.name);
        if (freVarExp.name === Names.nameForSelf) {
            freVarExp.referredClassifier = enclosingConcept;
            if (this.strictUseOfSelf) {
                this.runner.nestedCheck({
                    check: !!freVarExp.applied,
                    error: `'self' should be followed by '.', followed by a property ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        freVarExp.applied!.language = freVarExp.language;
                        this.checkAppliedExp(freVarExp.applied!, enclosingConcept);
                    },
                });
            }
        } else {
            // see if variable refers to a property: case 1
            for (const e of enclosingConcept.allProperties()) {
                if (e.name === freVarExp.name) {
                    freVarExp.referredProperty = e;

                }
            }
            // see if variable refers to a classifier, not to a property: case 2
            if (!freVarExp.referredProperty) {
                // variable could refer to a classifier, not to a property
                const myClassifier = this.language?.classifiers().find(cls => cls.name === freVarExp.name)
                if (!!myClassifier) {
                    freVarExp.referredClassifier = myClassifier;
                }
            }
            // NB To give a good error message we distinguish between the two above cases. But only when neither of them can be found.
            if (!freVarExp.referredProperty && !freVarExp.referredClassifier) {
                this.runner.nestedCheck({
                    check: !!freVarExp.referredProperty,
                    error: `Cannot find property '${freVarExp.name}' in '${enclosingConcept.name}' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        if (!!freVarExp.applied) {
                            this.runner.nestedCheck({
                                check: !freVarExp.referredProperty.isList,
                                error: `List property '${freVarExp.referredProperty.name}' cannot have an applied expression (.${freVarExp.applied.toFreString()})` +
                                  ` ${ParseLocationUtil.location(freVarExp)}.`,
                                whenOk: () => {
                                    freVarExp.applied!.language = freVarExp.language;
                                    this.checkAppliedExp(freVarExp.applied!, enclosingConcept);
                                }
                            });
                        }
                    },
                });
                this.runner.nestedCheck({
                    check: !!freVarExp.referredClassifier,
                    error: `Cannot find classifier '${freVarExp.name}' in language '${this.language?.name}' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        if (!!freVarExp.applied) {
                            this.runner.nestedCheck({
                                check: !freVarExp.referredProperty.isList,
                                error: `List property '${freVarExp.referredProperty.name}' cannot have an applied expression (.${freVarExp.applied.toFreString()})` +
                                  ` ${ParseLocationUtil.location(freVarExp)}.`,
                                whenOk: () => {
                                    freVarExp.applied!.language = freVarExp.language;
                                    this.checkAppliedExp(freVarExp.applied!, enclosingConcept);
                                }
                            });
                        }
                    },
                });
            }
        }
    }

    private checkFunctionExp(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkFunctionExp " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        const functionName = validFunctionNames.find((name) => name === freFunctionExp.name);
        this.runner.nestedCheck({
            check: functionName !== undefined && functionName !== null,
            error: `${freFunctionExp.name} is not a valid function ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                LOGGER.log('checking functions');
                switch (freFunctionExp.name) {
                    // Possible values ["conformsTo", "equalsType", "type", "owner", "if"];
                    case validFunctionNames[0]: { this.checkConformsFunction(freFunctionExp, enclosingConcept); break;}
                    case validFunctionNames[1]: { this.checkEqualsFunction(freFunctionExp, enclosingConcept); break;}
                    case validFunctionNames[2]: { this.checkTypeFunction(freFunctionExp, enclosingConcept); break;}
                    case validFunctionNames[3]: { this.checkOwnerFunction(freFunctionExp, enclosingConcept); break;}
                    case validFunctionNames[4]: { this.checkIfFunction(freFunctionExp, enclosingConcept); break;}
                }
                if (!!freFunctionExp.applied) {
                    this.runner.nestedCheck({
                        check: freFunctionExp.name !== validFunctionNames[2],
                        error: `A dot-expression is not allowed after '${validFunctionNames[2]}()' ${ParseLocationUtil.location(freFunctionExp)}.`,
                        whenOk: () => {
                            freFunctionExp.applied!.language = freFunctionExp.language;
                            this.checkAppliedExp(freFunctionExp.applied!, enclosingConcept);
                        }
                    })
                }
            }
        });
    }

    private checkConformsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        // TODO
        LOGGER.log("checkConformsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        if (!!freFunctionExp.param) {
            freFunctionExp.param!.language = freFunctionExp.language;
            this.checkLangExp(freFunctionExp.param!, enclosingConcept);
        }
    }

    private checkEqualsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        // TODO
        LOGGER.log("checkEqualsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        if (!!freFunctionExp.param) {
            freFunctionExp.param!.language = freFunctionExp.language;
            this.checkLangExp(freFunctionExp.param!, enclosingConcept);
        }
    }

    //@ts-ignore
    private checkTypeFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkTypeFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        this.runner.simpleCheck(
          freFunctionExp.param === undefined || freFunctionExp.param === null,
          `Function ${freFunctionExp.name}() may not have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`
        );
    }

    //@ts-ignore
    private checkOwnerFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkOwnerFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        this.runner.nestedCheck({
            check: freFunctionExp.param === undefined || freFunctionExp.param === null,
            error: `Function ${freFunctionExp.name}() may not have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                // Try to find the resulting classifier
                const owners: FreMetaClassifier[] = this.findPossibleOwnersOf(enclosingConcept);
                if (owners.length === 1) {
                    freFunctionExp.referredClassifier = owners[0];
                }
            }
        });
    }

    private checkIfFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkIfFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name);
        const param = freFunctionExp.param;
        this.runner.nestedCheck({
            check: param !== undefined && param !== null,
            error: `Function ${freFunctionExp.name}() should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                // The parameter should refer to a classifier
                freFunctionExp.param!.language = freFunctionExp.language;
                this.checkLangExp(freFunctionExp.param!, enclosingConcept);
                const paramValue: FreMetaClassifier | undefined = freFunctionExp.param!.getResultingClassifier();
                const subtypes: FreMetaClassifier[] = this.findPossibleSubTypesOf(enclosingConcept);

                LOGGER.log(`paramValue: ${paramValue?.name}, enclosingConcept: ${enclosingConcept.name}, subtypes: [${subtypes.map(xx => xx.name).join(', ')}]`);

                this.runner.nestedCheck({
                    check: !!paramValue,
                    error: `Parameter '${freFunctionExp.param!.toFreString()}' of ${freFunctionExp.name}() should denote a classifier ${ParseLocationUtil.location(freFunctionExp)}.`,
                    whenOk: () => {
                        this.runner.nestedCheck({
                            check: subtypes.includes(paramValue!),
                            error: `Cannot limit to classifier '${paramValue!.name}', it is not a possible subtype ([${subtypes.map(xx => xx.name).join(", ")}]) ${ParseLocationUtil.location(freFunctionExp)}.`,
                            whenOk: () => {
                                // Set the resulting classifier
                                freFunctionExp.referredClassifier = paramValue!;
                            }
                        });
                    }
                });
            }
        })
    }

    private checkAppliedExp(freAppliedExp: FreAppliedExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkAppliedExp " + freAppliedExp?.toFreString() + " in " + enclosingConcept.name);
        if (!!freAppliedExp.previous) {
            this.runner.nestedCheck({
              check: freAppliedExp.exp.name !== Names.nameForSelf,
              error: `'self' may be used only at the start of an expression ${ParseLocationUtil.location(freAppliedExp)}.`,
              whenOk: () => {
                  // Get enclosing concept from previous expression, i.e. get type of 'a' in 'a.b'
                  let innerConcept: FreMetaClassifier | undefined = freAppliedExp.previous.getLocalClassifier();

                  // NB The following check is to see whether the classifier of the previous expression could be established.
                  // Not knowing the classifier of the previous expression is valid, only when the current expression if an 'if()',
                  // because the 'if()' limits the number of possible types to one.
                  // Therefore, the normal error message contains a suggestion to use the 'if()'. But when the previous expression
                  // was an 'if()', this suggestion is not very useful. We do not want to suggest '.if().if()'.
                  let errorStr: string = ` Maybe add '.${validFunctionNames[4]}()'.`;
                  if (freAppliedExp.previous instanceof FreFunctionExp && freAppliedExp.previous.name === validFunctionNames[4]) {
                      errorStr = '';
                  }
                  this.runner.nestedCheck({
                      check: !!innerConcept || freAppliedExp.exp.name === validFunctionNames[4],
                      error: `Cannot establish the type of '${freAppliedExp.previous.toErrorString()}'.${errorStr} ${ParseLocationUtil.location(freAppliedExp.previous)}.`,
                      whenOk: () => {
                          freAppliedExp.exp!.language = freAppliedExp.language;
                          if (!!innerConcept) {
                              this.checkLangExp(freAppliedExp.exp!, innerConcept);
                          } else {
                              this.checkLangExp(freAppliedExp.exp!, enclosingConcept);
                          }
                      }
                  })
                }
            })
        } else {
            LOGGER.log(`Parse error: Applied Expression ${freAppliedExp.toFreString()} does not have a previous expression ${ParseLocationUtil.location(freAppliedExp)}.`)
        }
    }

    private findPossibleOwnersOf(innerConcept: FreMetaClassifier): FreMetaClassifier[] {
        const foundOwners: Set<FreMetaClassifier> = new Set<FreMetaClassifier>();
        this.language?.classifiers().forEach(classifier => {
            classifier.allProperties().forEach(property => {
                if (LangUtil.conforms(property.typeReference.referred, innerConcept)) {
                    foundOwners.add(classifier);
                    // add all its subtypes as well
                    LangUtil.subClassifiers(classifier).forEach( cls => {
                        foundOwners.add(cls);
                    })
                }
            })
        });
        return Array.from(foundOwners);
    }

    private findPossibleSubTypesOf(enclosingConcept: FreMetaClassifier) {
        return LangUtil.subClassifiers(enclosingConcept);
    }
}
