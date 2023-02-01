import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";
import { CheckRunner, Checker } from "../../utils";
import {
    PiConcept,
    PiLanguage,
    PiProperty,
    PiClassifier
} from "../../languagedef/metalanguage";
import { PiAlternativeScope, PiNamespaceAddition, PiScopeDef } from "./PiScopeDefLang";
import { LangUtil, MetaLogger } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiLangExpressionChecker } from "../../languagedef/checking";
import { CommonChecker } from "../../languagedef/checking/CommonChecker";

const LOGGER = new MetaLogger("ScoperChecker").mute();

// TODO use ParseLocatonUtil
export class ScoperChecker extends Checker<PiScopeDef> {
    runner = new CheckRunner(this.errors, this.warnings);
    myExpressionChecker: PiLangExpressionChecker;
    myNamespaces: PiClassifier[] = [];

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
        // in a scope definition an expression may be simply 'self'
        // this.myExpressionChecker.strictUseOfThis = false;
    }

    public check(definition: PiScopeDef): void {
        LOGGER.log("Checking scope definition " + definition.scoperName);
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Scoper definition checker does not known the language.`);
        }
        this.runner = new CheckRunner(this.errors, this.warnings);

        this.runner.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error:  `Language reference ('${definition.languageName}') in scoper definition '${definition.scoperName}' ` +
                        `does not match language '${this.language.name}' [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`
            });

        // check the namespaces and find any subclasses or implementors of interfaces that are mentioned in the list of namespaces in the definition
        this.myNamespaces = this.findAllNamespaces(definition.namespaces);

        definition.scopeConceptDefs.forEach(def => {
            CommonChecker.checkClassifierReference(def.conceptRef, this.runner);
            if (!!def.conceptRef.referred) {
                if (!!def.namespaceAdditions) {
                    this.checkNamespaceAdditions(def.namespaceAdditions, def.conceptRef.referred);
                }
                if (!!def.alternativeScope) {
                    this.checkAlternativeScope(def.alternativeScope, def.conceptRef.referred);
                }
            }
        });
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkNamespaceAdditions(namespaceAddition: PiNamespaceAddition, enclosingConcept: PiConcept) {
        LOGGER.log("Checking namespace definition for " + enclosingConcept?.name);
        this.runner.nestedCheck({
            check: this.myNamespaces.includes(enclosingConcept),
            error: `Cannot add namespaces to concept ${enclosingConcept.name} that is not a namespace itself [file: ${namespaceAddition.location.filename}:${namespaceAddition.location?.start.line}:${namespaceAddition.location?.start.column}].`,
            whenOk: () => {
                namespaceAddition.expressions.forEach(exp => {
                    this.myExpressionChecker.checkLangExp(exp, enclosingConcept);
                    const xx: PiProperty = exp.findRefOfLastAppliedFeature();
                    if (!!xx) {
                        this.runner.nestedCheck({
                            check: (!!xx.type && (xx.type instanceof PiConcept || xx.type instanceof PiUnitDescription)),
                            error: `A namespace addition should refer to a concept [line: ${exp.location?.start.line}, column: ${exp.location?.start.column}].`,
                            whenOk: () => {
                                this.runner.simpleCheck(this.myNamespaces.includes(xx.type),
                                    `A namespace addition should refer to a namespace concept [line: ${exp.location?.start.line}, column: ${exp.location?.start.column}].`);
                            }
                        });
                    }
                });
            }
        });
    }

    private checkAlternativeScope(alternativeScope: PiAlternativeScope, enclosingConcept: PiConcept) {
        LOGGER.log("Checking alternative scope definition for " + enclosingConcept?.name);
        this.myExpressionChecker.checkLangExp(alternativeScope.expression, enclosingConcept);
    }

    private findAllNamespaces(namespaces: PiElementReference<PiClassifier>[]): PiClassifier[] {
        let result: PiClassifier[] = [];
        namespaces.forEach(ref => {
            CommonChecker.checkClassifierReference(ref, this.runner);
            const myClassifier = ref.referred;
            if (!!myClassifier) { // error message handled by checkClassifierReference()
                result = result.concat(LangUtil.findAllImplementorsAndSubs(myClassifier));
            }
        });
        return result;
    }
}
