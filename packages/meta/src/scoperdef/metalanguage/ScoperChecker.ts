import {
    FreMetaLanguage,
    FreMetaClassifier, LangUtil, MetaElementReference
} from '../../languagedef/metalanguage/index.js';
import {
    FreNamespaceAlternative,
    FreNamespaceImport,
    ScopeDef,
    FreMetaNamespaceInfo, ScopeConceptDef
} from './FreScopeDefLang.js';
import { FreLangExpressionChecker } from '../../langexpressions/checking/FreLangExpressionChecker.js';
import { FreFunctionExp, FreLangExp, FreVarExp } from '../../langexpressions/metalanguage/index.js';
import { Checker, CheckRunner, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { ReferenceResolver } from '../../languagedef/checking/ReferenceResolver.js';
import { isNullOrUndefined } from '../../utils/file-utils/index.js';
import { Names } from '../../utils/on-lang/index.js';


const LOGGER = new MetaLogger("ScoperChecker").mute();

export class ScoperChecker extends Checker<ScopeDef> {
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);
    myExpressionChecker: FreLangExpressionChecker;
    myNamespaces: FreMetaClassifier[] = [];

    constructor(language: FreMetaLanguage) {
        super(language);
        // NB This statement is here to avoid checks on the presence of 'myExpressionChecker'.
        // If 'language' is null or undefined, the 'check' method will not be executed.
        this.myExpressionChecker = new FreLangExpressionChecker(this.language);
    }

    public check(definition: ScopeDef): void {
        LOGGER.log("Checking scope definition " + definition.languageName);
        if (this.language === null || this.language === undefined) {
            throw new Error(`Scoper definition checker does not known the language.`);
        } else {
            this.myExpressionChecker = new FreLangExpressionChecker(this.language);
        }
        this.runner = new CheckRunner(this.errors, this.warnings);

        // check the namespaces and find any subclasses or implementors of interfaces that are mentioned in the list of namespaces in the definition
        this.myNamespaces = this.findAllNamespaces(definition.namespaceRefs);
        // disregard the namespaces in the definition (definition.namespaceRefs), instead use the complete set that we have found here!
        definition.namespaces = this.myNamespaces;

        // check all concept entries, make sure there are no doubles
        const done: FreMetaClassifier[] = [];
        definition.scopeConceptDefs.forEach((def) => {
            // NB we cannot use 'def.classifier', because all references still need to be resolved.
            if (!!def.classifierRef) {
                ReferenceResolver.resolveClassifierReference(def.classifierRef, this.runner, this.language!);
                if (!!def.classifierRef.referred) {
                    this.runner.nestedCheck({
                        check: !done.includes(def.classifierRef.referred),
                        error: `Double entry (${def.classifierRef?.name}) is not allowed ${ParseLocationUtil.location(def)}.`,
                        whenOk: () => {
                            this.runner.nestedCheck({
                                check: !(!!def.namespaceImports && !!def.namespaceAlternatives),
                                error: `Namespace may be defined by either 'imports' or 'alternatives', not both ${ParseLocationUtil.location(def)}.`,
                                whenOk: () => {
                                    if (!!def.namespaceImports) {
                                        this.checkNamespaceAdditions(def.namespaceImports, def.classifierRef!.referred);
                                    }
                                    if (!!def.namespaceAlternatives) {
                                        this.checkAlternativeNamespace(def.namespaceAlternatives, def.classifierRef!.referred);
                                    }
                                }
                            });
                        }
                    });
                    done.push(def.classifierRef.referred);
                }
            }
        });

        // distribute the scope information over sub classifiers and implementing classifiers
        definition.namespaces.forEach((parent) => {
            // find the scopeDef associated with 'parent'
            const parentDef = definition.scopeConceptDefs.find((def) => def.classifier === parent);
            if (!isNullOrUndefined(parentDef)) {
                // find all implementors and subs
                const children = LangUtil.findAllImplementorsAndSubs(parent);
                // add parent scopeDef to all children
                children.forEach((child) => {
                    if (child !== parent) {
                        // try to find child scopeDef
                        const childDef = definition.scopeConceptDefs.find((def) => def.classifier === child);
                        if (isNullOrUndefined(childDef)) {
                            // create a new scopeDef
                            const newDef = new ScopeConceptDef();
                            if (!isNullOrUndefined(parentDef.namespaceImports)) {
                                newDef.namespaceImports = new FreNamespaceImport();
                                newDef.namespaceImports.nsInfoList = this.copyNamespaceExpressions(parentDef.namespaceImports.nsInfoList);
                            }
                            if (!isNullOrUndefined(parentDef.namespaceAlternatives)) {
                                newDef.namespaceAlternatives = new FreNamespaceAlternative();
                                newDef.namespaceAlternatives.nsInfoList = this.copyNamespaceExpressions(parentDef.namespaceAlternatives.nsInfoList);
                            }
                        } else {
                            // add additions to existing scopeDef, but first check if this is correct
                            if (!isNullOrUndefined(parentDef.namespaceImports)) {
                                this.runner.nestedCheck({
                                    check: isNullOrUndefined(childDef.namespaceAlternatives),
                                    error: `Parent scope definition (${parent.name}) does not comply with scope definition for ${child.name} ${ParseLocationUtil.location(child)}.`,
                                    whenOk: () => {
                                        if (!isNullOrUndefined(childDef.namespaceImports)) {
                                            childDef.namespaceImports?.nsInfoList.push(...this.copyNamespaceExpressions(parentDef.namespaceImports?.nsInfoList));
                                        }
                                    }
                                })
                            }
                            if (!isNullOrUndefined(parentDef.namespaceAlternatives)) {
                                this.runner.nestedCheck({
                                    check: isNullOrUndefined(childDef.namespaceImports),
                                    error: `Parent scope definition (${parent.name}) does not comply with scope definition for ${child.name} ${ParseLocationUtil.location(child)}.`,
                                    whenOk: () => {
                                        if (!isNullOrUndefined(childDef.namespaceAlternatives)) {
                                            childDef.namespaceAlternatives?.nsInfoList.push(...this.copyNamespaceExpressions(parentDef.namespaceAlternatives?.nsInfoList));
                                        }
                                    }
                                })
                            }
                        }
                    }
                })
            }
        })

        // add any errors on the nsInfoList used
        if (!!this.myExpressionChecker) {
            this.errors = this.myExpressionChecker.errors.concat(this.errors);
        }
    }

    private checkNamespaceAdditions(namespaceAddition: FreNamespaceImport, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace additions for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot change namespace ${enclosingConcept.name}, because it is not defined as namespace ${ParseLocationUtil.location(namespaceAddition)}.`,
            whenOk: () => {
                namespaceAddition.nsInfoList.forEach((exp) => {
                    this.checkNamespaceExpression(exp, enclosingConcept)
                })
            },
        });
    }

    private checkAlternativeNamespace(namespaceReplacement: FreNamespaceAlternative, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace replacements for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot change namespace ${enclosingConcept.name}, because it is not defined as namespace ${ParseLocationUtil.location(namespaceReplacement)}.`,
            whenOk: () => {
                if (!!this.myExpressionChecker) {
                    namespaceReplacement.nsInfoList.forEach((nsInfo) => {
                        this.checkNamespaceExpression(nsInfo, enclosingConcept);
                        const myExpression = nsInfo.expression;
                        let toBeTested: FreLangExp | undefined;
                        if (myExpression instanceof FreVarExp && myExpression.name === Names.nameForSelf) {
                            toBeTested = myExpression.applied;
                        } else {
                            toBeTested = myExpression;
                        }
                        if (!!toBeTested) {
                            this.runner.simpleCheck(
                              toBeTested.getIsPart(),
                              `Cannot use a reference (${toBeTested.toErrorString()}) as alternative namespace for ${enclosingConcept.name}, because its needs to be resolved within the namespace it is altering ${ParseLocationUtil.location(nsInfo)}.`
                            )
                        }
                    })
                }
            },
        });
    }

    private checkNamespaceExpression(namespaceExpression: FreMetaNamespaceInfo, enclosingConcept: FreMetaClassifier) {
        LOGGER.log("Checking namespace expression for " + enclosingConcept?.name);
        const exp = namespaceExpression.expression;
        if (!!exp) {
            this.myExpressionChecker.checkLangExp(exp, enclosingConcept, this.runner);
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
            ReferenceResolver.resolveClassifierReference(ref, this.runner, this.language!);
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
    private isSetofNamespaces(classifierSet: FreMetaClassifier[]): string[] {
        let result: string[] = [];
        classifierSet.forEach( ref => {
            if (!this.myNamespaces.includes(ref)) {
                result.push(ref.name);
            }
        })
        return result;
    }

    private copyNamespaceExpressions(infos: FreMetaNamespaceInfo[] | undefined): FreMetaNamespaceInfo[] {
        let result: FreMetaNamespaceInfo[] = [];
        if (!isNullOrUndefined(infos)) {
            infos.forEach(info => {
                const xx = new FreMetaNamespaceInfo();
                // NB we do not need to make a true copy of the expressions. They are not altered, just read.
                xx.expression = info.expression;
                xx.recursive = info.recursive;
                result.push(xx);
            })
        }
        return result;
    }
}
