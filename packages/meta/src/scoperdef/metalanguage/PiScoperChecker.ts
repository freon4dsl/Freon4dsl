import { Checker } from "../../utils/Checker";
import { PiLangConcept, PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiNamespaceDef, PiScopeDef } from "./PiScopeDefLang";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage";

const LOGGER = new PiLogger("PiScoperChecker"); // .mute();
export class PiScoperChecker extends Checker<PiScopeDef> {
    myExpressionChecker : PiLanguageExpressionChecker;

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
            definition.scopeConceptDefs.forEach(def => {
                this.myExpressionChecker.checkConceptReference(def.conceptRef);
                if (!!def.conceptRef.referedElement()) {
                    // this.simpleCheck(definition.namespaces.conceptRef(def.conceptRef.referedElement()), "");
                    this.checkNamespaceDefinition(def.namespaceDef, def.conceptRef.referedElement());
                }
            });
            this.errors = this.errors.concat(this.myExpressionChecker.errors);
        }

    private checkNamespaceDefinition(namespaceDef: PiNamespaceDef, enclosingConcept: PiLangConcept) {
        LOGGER.log("Checking namespace definition for " + enclosingConcept?.name);

        namespaceDef.expressions.forEach(exp => {
            this.myExpressionChecker.checkLangExp(exp, enclosingConcept);
        });
    }
}

