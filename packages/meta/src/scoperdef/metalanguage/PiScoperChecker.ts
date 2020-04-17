import { Checker } from "../../utils/Checker";
import {
    PiLangConcept,
    PiLanguageUnit,
    PiLangConceptReference,
    PiLanguageExpressionChecker,
    PiLangPrimitiveProperty, PiLangProperty
} from "../../languagedef/metalanguage";
import { PiNamespaceDef, PiScopeDef } from "./PiScopeDefLang";
import { refListIncludes } from "../../utils/ModelHelpers";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiScoperChecker"); // .mute();
export class PiScoperChecker extends Checker<PiScopeDef> {
    myExpressionChecker : PiLanguageExpressionChecker;
    myNamespaces: PiLangConceptReference[] = [];

    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
        // in a scope definition an expression may be simply 'self'
        // this.myExpressionChecker.strictUseOfThis = false;
    }

    public check(definition: PiScopeDef): void {
        LOGGER.log("Checking scope definition " + definition.scoperName);
        if( this.language === null ) {
            LOGGER.error(this,  `Scoper definition checker does not known the language, exiting [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`);
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error:  `Language reference ('${definition.languageName}') in scoper definition '${definition.scoperName}' `+
                        `does not match language '${this.language.name}' [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
            });
            definition.namespaces.forEach(ref => {
                    this.myExpressionChecker.checkConceptReference(ref);
            });
            this.myNamespaces = definition.namespaces;
            definition.scopeConceptDefs.forEach(def => {
                this.myExpressionChecker.checkConceptReference(def.conceptRef);
                if (!!def.conceptRef.referedElement()) {
                    if (!!def.namespaceDef) {
                        this.checkNamespaceDefinition(def.namespaceDef, def.conceptRef.referedElement());
                    }
                }
            });
            this.errors = this.errors.concat(this.myExpressionChecker.errors);
        }

    private checkNamespaceDefinition(namespaceDef: PiNamespaceDef, enclosingConcept: PiLangConcept) {
        LOGGER.log("Checking namespace definition for " + enclosingConcept?.name);
        this.nestedCheck({
            check: refListIncludes(this.myNamespaces, enclosingConcept),
            error: `Cannot add namespaces to a concept that is not a namespace itself [line: ${namespaceDef.location?.start.line}, column: ${namespaceDef.location?.start.column}].`,
            whenOk: () => {
                namespaceDef.expressions.forEach(exp => {
                    this.myExpressionChecker.checkLangExp(exp, enclosingConcept);
                    this.nestedCheck({
                        check: (exp.findRefOfLastAppliedFeature().type instanceof PiLangConceptReference),
                        error: `A namespace addition should refer to a concept [line: ${exp.location?.start.line}, column: ${exp.location?.start.column}].`,
                        whenOk: () => {
                            this.simpleCheck(refListIncludes(this.myNamespaces, exp.findRefOfLastAppliedFeature().type),
                                `A namespace addition should refer to a namespace concept [line: ${exp.location?.start.line}, column: ${exp.location?.start.column}].`);
                        }
                    })
                });
            }
        });

    }


}

