import { Names } from '../../utils/on-lang/index.js';
import { MetaLogger, MetaFunctionNames } from '../../utils/no-dependencies/index.js';
import { Checker, CheckRunner, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { LanguageExpressionTesterNew, TestExpressionsForConcept } from "../parser/LanguageExpressionTesterNew.js";
import {
    FreMetaLanguage,
    FreMetaClassifier,
    FreMetaLimitedConcept,
    FreMetaUnitDescription,
    LangUtil
} from '../../languagedef/metalanguage/index.js';
import {
    FreFunctionExp,
    FreLangExpNew,
    FreLangSimpleExpNew,
    FreLimitedInstanceExp,
    FreVarExp
} from '../metalanguage/index.js';
import { ReferenceResolver } from '../../languagedef/checking/ReferenceResolver.js';

const LOGGER = new MetaLogger("FreLangExpressionChecker").mute();

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
        LOGGER.log("checkLangSetExp " + rule.toFreString());
        ReferenceResolver.resolveClassifierReference(rule.classifierRef, this.runner, this.language!);

        const enclosingConcept = rule.classifierRef?.referred;
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
        } else if (langExp instanceof FreLangSimpleExpNew) {
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
     * @private
     */
    private checkVarExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkVarExp " + freVarExp?.toFreString() + " in " + enclosingConcept.name);
        if (freVarExp.name === Names.nameForSelf) {
            this.checkSelfExp(freVarExp, enclosingConcept);
        } else {
            if (!freVarExp.previous) {
                // var may be a classifier
                this.tryToResolveAsClassifier(freVarExp);
                // no error yet!
                // if not a classifier, var should be known as property in enclosing concept
                if (!freVarExp.referredClassifier) { // indicates that 'var' could not be resolved as classifier
                    this.tryToResolveAsProperty(enclosingConcept, freVarExp, enclosingConcept);
                }
            } else {
                // var may not be a classifier
                this.tryToResolveAsClassifier(freVarExp);
                this.runner.nestedCheck({
                    check: !freVarExp.referredClassifier,
                    error: `Classifier '${freVarExp.name}' may not be used after '.' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        // var should be known as property in meta type of previous
                        this.tryToResolveAsProperty(freVarExp.previous!.getLocalClassifier(), freVarExp, enclosingConcept);
                    }
                })
            }
        }
    }

    private tryToResolveAsProperty(myContext: FreMetaClassifier | undefined, freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier) {
        // error message on 'undefined' context already given in checkAppliedExp() ???
        // todo if so, remove this check!
        this.runner.nestedCheck({
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
                this.runner.nestedCheck({
                    check: !!freVarExp.referredProperty,
                    error: `Cannot find property '${freVarExp.name}' in classifier '${myContext!.name}' ${ParseLocationUtil.location(freVarExp)}.`,
                    whenOk: () => {
                        // check applied expression
                        this.checkAppliedExp(freVarExp, enclosingConcept);
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

    private checkSelfExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkSelfExp " + freVarExp?.toFreString() + " in " + enclosingConcept?.name);
        freVarExp.referredClassifier = enclosingConcept;
        this.runner.nestedCheck({
            check: !freVarExp.previous,
            error: `'self' may only appear at the start of an expression ${ParseLocationUtil.location(freVarExp)}.`,
            whenOk: () => {
                if (this.strictUseOfSelf) {
                    this.runner.nestedCheck({
                        check: !!freVarExp.applied,
                        error: `'self' should be followed by '.', followed by a property ${ParseLocationUtil.location(freVarExp)}.`,
                        whenOk: () => {
                            // check applied expression
                            this.checkAppliedExp(freVarExp, enclosingConcept);
                        }
                    });
                }
            }
        });
    }

    private checkFunctionExp(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("checkFunctionExp " + freFunctionExp?.toFreString() + " in " + enclosingConcept?.name);
        const functionName = MetaFunctionNames.allNames.find((name) => name === freFunctionExp.name);
        // name should be a valid meta function
        this.runner.nestedCheck({
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
                    case MetaFunctionNames.conformsToFunc: { this.checkConformsFunction(freFunctionExp, enclosingConcept, myContext); break;}
                    case MetaFunctionNames.equalsTypeFunc: { this.checkEqualsFunction(freFunctionExp, enclosingConcept, myContext); break;}
                    case MetaFunctionNames.typeFunc: { this.checkTypeFunction(freFunctionExp, enclosingConcept, myContext); break;}
                    case MetaFunctionNames.ownerFunc: { this.checkOwnerFunction(freFunctionExp, enclosingConcept, myContext); break;}
                    case MetaFunctionNames.ifFunc: { this.checkIfFunction(freFunctionExp, enclosingConcept, myContext); break;}
                }
            }
        });
    }

    private checkConformsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined) {
        // TODO checkConformsFunction needs to be extended when FreLangExpNew is used for the conforms function
        LOGGER.log("checkConformsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        this.runner.nestedCheck({
            check: !!freFunctionExp.param,
            error: `Function '${freFunctionExp.name}()' should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                freFunctionExp.param!.language = freFunctionExp.language;
                this.checkLangExp(freFunctionExp.param!, enclosingConcept);
            }
        })
    }

    private checkEqualsFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined) {
        // TODO checkEqualsFunction needs to be extended when FreLangExpNew is used for the equals function
        LOGGER.log("checkEqualsFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        this.runner.nestedCheck({
            check: !!freFunctionExp.param,
            error: `Function '${freFunctionExp.name}()' should have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                freFunctionExp.param!.language = freFunctionExp.language;
                this.checkLangExp(freFunctionExp.param!, enclosingConcept);
            }
        })
    }

    private checkTypeFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined) {
        LOGGER.log("checkTypeFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        this.runner.nestedCheck({
            check: freFunctionExp.param === undefined || freFunctionExp.param === null,
            error: `Function '${freFunctionExp.name}()' may not have a parameter ${ParseLocationUtil.location(freFunctionExp)}.`,
            whenOk: () => {
                this.runner.simpleCheck(
                    !freFunctionExp.applied,
                    `A dot-expression is not allowed after '${MetaFunctionNames.typeFunc}()' ${ParseLocationUtil.location(freFunctionExp)}.`
                )
            }
        });
    }

    private checkOwnerFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined) {
        LOGGER.log("checkOwnerFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        this.runner.nestedCheck({
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
                this.checkAppliedExp(freFunctionExp, enclosingConcept);
            }
        });
    }

    private checkIfFunction(freFunctionExp: FreFunctionExp, enclosingConcept: FreMetaClassifier, myContext: FreMetaClassifier | undefined) {
        LOGGER.log("checkIfFunction " + freFunctionExp?.toFreString() + " in " + enclosingConcept.name + " with context " + myContext?.name);
        const param = freFunctionExp.param;
        this.runner.nestedCheck({
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
                this.runner.nestedCheck({
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
                        this.runner.nestedCheck({
                            check: possibleClassifiers.includes(paramValue!),
                            error: `Cannot limit to classifier '${paramValue!.name}', it is not a possible value ([${possibleClassifiers.map(xx => xx.name).join(", ")}]) ${ParseLocationUtil.location(freFunctionExp)}.`,
                            whenOk: () => {
                                // Set the resulting classifier
                                freFunctionExp.referredClassifier = paramValue!;
                                // check applied expression
                                this.checkAppliedExp(freFunctionExp, enclosingConcept);
                            }
                        });
                    }
                });
            }
        })
    }

    private checkAppliedExp(freVarExp: FreVarExp, enclosingConcept: FreMetaClassifier) {
        if (!!freVarExp.applied) {
            freVarExp.applied!.language = freVarExp.language;
            this.checkLangExp(freVarExp.applied!, enclosingConcept);
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
