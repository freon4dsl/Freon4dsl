import { CheckRunner, Checker, ParseLocationUtil } from "../../utils/index.js";
import {
    FreMetaConcept,
    FreMetaLanguage,
    FreMetaProperty,
    FreMetaClassifier, FreMetaInterface
} from '../../languagedef/metalanguage/index.js';
import { FreReplacementNamespace, FreNamespaceAddition, ScopeDef } from "./FreScopeDefLang.js";
import { LangUtil, MetaLogger } from "../../utils/index.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference, FreMetaUnitDescription } from "../../languagedef/metalanguage/index.js";
import { FreLangExpressionChecker } from "../../languagedef/checking/index.js";
import { CommonChecker } from "../../languagedef/checking/index.js";

const LOGGER = new MetaLogger("ScoperChecker").mute();

export class ScoperChecker extends Checker<ScopeDef> {
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);
    myExpressionChecker: FreLangExpressionChecker | undefined;
    myNamespaces: FreMetaClassifier[] = [];

    constructor(language: FreMetaLanguage) {
        super(language);
        if (!!this.language) {
            this.myExpressionChecker = new FreLangExpressionChecker(this.language);
        }
        // in a scope definition an expression may be simply 'self'
        // this.myExpressionChecker.strictUseOfThis = false;
    }

    public check(definition: ScopeDef): void {
        LOGGER.log("Checking scope definition " + definition.scoperName);
        if (this.language === null || this.language === undefined) {
            throw new Error(`Scoper definition checker does not known the language.`);
        }
        this.runner = new CheckRunner(this.errors, this.warnings);

        // check the namespaces and find any subclasses or implementors of interfaces that are mentioned in the list of namespaces in the definition
        this.myNamespaces = this.findAllNamespaces(definition.namespaces);

        definition.scopeConceptDefs.forEach((def) => {
            if (!!def.conceptRef) {
                CommonChecker.checkClassifierReference(def.conceptRef, this.runner);
                if (!!def.conceptRef.referred) {
                    if (!!def.namespaceAdditions) {
                        this.checkNamespaceAdditions(def.namespaceAdditions, def.conceptRef.referred);
                    }
                    if (!!def.replacementNamespace) {
                        this.checkReplacementNamespace(def.replacementNamespace, def.conceptRef.referred);
                    }
                }
            }
        });
        if (!!this.myExpressionChecker) {
            this.errors = this.errors.concat(this.myExpressionChecker.errors);
        }
    }

    private checkNamespaceAdditions(namespaceAddition: FreNamespaceAddition, enclosingConcept: FreMetaConcept) {
        LOGGER.log("Checking namespace definition for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot add namespaces to concept ${enclosingConcept.name} that is not a namespace itself ${ParseLocationUtil.location(namespaceAddition)}.`,
            whenOk: () => {
                if (!!this.myExpressionChecker) {
                    namespaceAddition.expressions.forEach((exp) => {
                        this.myExpressionChecker!.checkLangExp(exp, enclosingConcept);
                        const xx: FreMetaProperty | undefined = exp.findRefOfLastAppliedFeature();
                        if (!!xx) {
                            this.runner.nestedCheck({
                                check:
                                    !!xx.type &&
                                    (xx.type instanceof FreMetaConcept || xx.type instanceof FreMetaUnitDescription || xx.type instanceof FreMetaInterface),
                                error: `A namespace addition should refer to a concept or a unit ${ParseLocationUtil.location(exp)}.`,
                                whenOk: () => {
                                    this.runner.simpleCheck(
                                        this.myNamespaces.includes(xx.type),
                                        `A namespace addition should refer to a namespace concept ${ParseLocationUtil.location(exp)}.`,
                                    );
                                },
                            });
                        }
                    });
                }
            },
        });
    }

    private checkReplacementNamespace(replacementNamespace: FreReplacementNamespace, enclosingConcept: FreMetaConcept) {
        LOGGER.log("Checking replacement scope definition for " + enclosingConcept?.name);
        if (!!this.myExpressionChecker && !!replacementNamespace.expression) {
            this.myExpressionChecker.checkLangExp(replacementNamespace.expression, enclosingConcept);
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
}
