import { Checker } from "../../utils/Checker";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "./PiScopeDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageExpressionChecker } from "../../languagedef/metalanguage";

const LOGGER = new PiLogger("PiScoperChecker"); // .mute();
export class PiScoperChecker extends Checker<PiScopeDef> {
    myExpressionChecker : PiLanguageExpressionChecker;

    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(definition: PiScopeDef): void {
        // LOGGER.log("Checking scope definition " + definition.scoperName);
        if( this.language === null ) {
            LOGGER.error(this,  `Scoper definition checker does not known the language, exiting [line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`);
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error:  `Language reference ('${definition.languageName}') in scoper definition '${definition.scoperName}' `+
                        `does not match language '${this.language.name}'[line: ${definition.location?.start.line}, column: ${definition.location?.start.column}].`,
            });
            definition.namespaces.forEach(ns => {
                ns.conceptRefs.forEach(ref =>
                    this.myExpressionChecker.checkConceptReference(ref)
                )
            });
            // definition.
        }

}

