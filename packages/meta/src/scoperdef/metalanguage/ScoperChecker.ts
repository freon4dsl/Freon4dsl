import { CheckRunner, Checker, ParseLocationUtil } from "../../utils/index.js";
import {
    FreMetaLanguage,
    FreMetaClassifier
} from '../../languagedef/metalanguage/index.js';
import {
    FreReplacementNamespace,
    FreNamespaceAddition,
    ScopeDef,
    FreNamespaceExpression
} from './FreScopeDefLang.js';
import { LangUtil, MetaLogger } from "../../utils/index.js";
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";
import { CommonChecker } from "../../languagedef/checking/index.js";
import { FreLangExpressionCheckerNew } from '../../langexpressions/checking/FreLangExpressionCheckerNew.js';
import { FreFunctionExp } from '../../langexpressions/metalanguage/index.js';

const LOGGER = new MetaLogger("ScoperChecker").mute();

export class ScoperChecker extends Checker<ScopeDef> {
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);
    myExpressionChecker: FreLangExpressionCheckerNew;
    myNamespaces: FreMetaClassifier[] = [];

    constructor(language: FreMetaLanguage) {
        super(language);
        // NB This statement is here to avoid checks on the presence of 'myExpressionChecker'.
        // If 'language' is null or undefined, the 'check' method will not be executed.
        this.myExpressionChecker = new FreLangExpressionCheckerNew(this.language);
    }

    public check(definition: ScopeDef): void {
        LOGGER.log("Checking scope definition " + definition.languageName);
        if (this.language === null || this.language === undefined) {
            throw new Error(`Scoper definition checker does not known the language.`);
        } else {
            this.myExpressionChecker = new FreLangExpressionCheckerNew(this.language);
        }
        this.runner = new CheckRunner(this.errors, this.warnings);

        // check the namespaces and find any subclasses or implementors of interfaces that are mentioned in the list of namespaces in the definition
        this.myNamespaces = this.findAllNamespaces(definition.namespaces);

        // check all concept entries, make sure there are no doubles
        const done: FreMetaClassifier[] = [];
        definition.scopeConceptDefs.forEach((def) => {
            if (!!def.classifierRef) {
                this.runner.nestedCheck({
                    check: !done.includes(def.classifierRef.referred),
                    error: `Double entry (${def.classifierRef?.name}) is not allowed ${ParseLocationUtil.location(def)}.`,
                    whenOk: () => {
                        CommonChecker.checkClassifierReference(def.classifierRef!, this.runner);
                        if (!!def.classifierRef!.referred) {
                            if (!!def.namespaceAddition) {
                                this.checkNamespaceAdditions(def.namespaceAddition, def.classifierRef!.referred);
                            }
                            if (!!def.namespaceReplacement) {
                                this.checkReplacementNamespace(def.namespaceReplacement, def.classifierRef!.referred);
                            }
                        }
                    }
                });
                done.push(def.classifierRef.referred)
            }
        });
        if (!!this.myExpressionChecker) {
            this.errors = this.errors.concat(this.myExpressionChecker.errors);
        }
    }

    private checkNamespaceAdditions(namespaceAddition: FreNamespaceAddition, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace additions for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot change namespace ${enclosingConcept.name}, because it is not defined as namespace ${ParseLocationUtil.location(namespaceAddition)}.`,
            whenOk: () => {
                namespaceAddition.expressions.forEach((exp) => {
                    this.checkNamespaceExpression(exp, enclosingConcept)
                })
            },
        });
    }

    private checkReplacementNamespace(namespaceReplacement: FreReplacementNamespace, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace replacements for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot change namespace ${enclosingConcept.name}, because it is not defined as namespace ${ParseLocationUtil.location(namespaceReplacement)}.`,
            whenOk: () => {
                if (!!this.myExpressionChecker) {
                    namespaceReplacement.expressions.forEach((exp) => {
                        this.checkNamespaceExpression(exp, enclosingConcept)
                    })
                }
            },
        });
    }

    private checkNamespaceExpression(namespaceExpression: FreNamespaceExpression, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace expression for " + enclosingConcept?.name);
        const exp = namespaceExpression.expression;
        if (!!exp) {
            this.myExpressionChecker.checkLangExp(exp, enclosingConcept);
            const foundClassifier: FreMetaClassifier | undefined = exp.getResultingClassifier();
            // NB It is correct that foundClassifier is undefined, when the last of the expression
            // is either 'owner()' of 'type()', otherwise it is incorrect.
            // In the case of 'owner()', all the types of all possible owners must be in the set of known namespaces.
            // In the case of 'type()', we do not test any further. TODO augment checking of 'type()' function in scoper.
            let doNotCheck: boolean = false;
            if (!foundClassifier) {
                const lastExp = exp.getLastExpression();
                if (lastExp instanceof FreFunctionExp) {
                    if (lastExp.name === 'owner') {
                        doNotCheck = true;
                        const nonNamespaceClassifiers: string[] = this.isSetofNamespaces(lastExp.possibleClassifiers);
                        this.runner.nestedCheck({
                            check: !nonNamespaceClassifiers || nonNamespaceClassifiers.length === 0,
                            error: `One or more of the possible owners is not a namespace ([${nonNamespaceClassifiers}]) ${ParseLocationUtil.location(exp)}.`,
                            whenOk: () => {

                            }
                        })
                    } else if (lastExp.name === 'type') {
                        doNotCheck = true;
                    }
                }
            }
            if (!doNotCheck) {
                this.runner.simpleCheck(
                  !!foundClassifier && this.myNamespaces.includes(foundClassifier),
                  `A namespace expression should refer to a namespace (found: '${foundClassifier?.name}') ${ParseLocationUtil.location(exp)}.`
                );
            }
        }
    }

    private findAllNamespaces(namespaces: MetaElementReference<FreMetaClassifier>[]): FreMetaClassifier[] {
        let result: FreMetaClassifier[] = [];
        namespaces.forEach((ref) => {
            CommonChecker.checkClassifierReference(ref, this.runner);
            const myClassifier = ref.referred;
            if (!!myClassifier) {
                // error message handled by checkClassifierReference()
                result = result.concat(LangUtil.findAllImplementorsAndSubs(myClassifier));
            }
        });
        return result;
    }

    /**
     * Checks whether all classifier in 'classifierSet' are namespaces, and returns the names of the ones that are not.
     *
     * @param classifierSet
     * @private
     */
    private isSetofNamespaces(classifierSet: MetaElementReference<FreMetaClassifier>[]): string[] {
        let result: string[] = [];
        classifierSet.forEach( ref => {
            const foundClassifier = ref.referred;
            if (!this.myNamespaces.includes(foundClassifier)) {
                result.push(foundClassifier.name);
            }
        })
        return result;
    }
}
