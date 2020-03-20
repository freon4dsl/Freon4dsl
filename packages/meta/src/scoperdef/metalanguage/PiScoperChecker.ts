import { Checker } from "../../utils/Checker";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "./PiScopeDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiScoperChecker"); // .mute();
export class PiScoperChecker extends Checker<PiScopeDef> {
    
    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
    }

    public check(definition: PiScopeDef, verbose: boolean): void {
        if (verbose) LOGGER.log("Checking scope definition " + definition.scoperName);
        if( this.language === null ) {
            LOGGER.error(this,  "Scoper definition checker does not known the language, exiting.");
            process.exit(-1);
        }

        this.nestedCheck(
            {
                check: this.language.name === definition.languageName,
                error: `Language reference ('${definition.languageName}') in scoper definition '${definition.scoperName}' does not match language '${this.language.name}'.`,
            });
            definition.namespaces.forEach(ns => {
                ns.conceptRefs.forEach(ref => 
                    this.checkConceptReference(ref)
                )
            });
        }

    checkConceptReference(reference: PiLangConceptReference) {
        // note that the following statement is crucial, because the model we are testing is separate
        // from the model of the language
        reference.language = this.language;
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Element reference ${"UNKNOWN"}.type should have a name, but doesn't`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.concept() !== undefined,
                        error: `ElementReference to ${reference.name} cannot be resolved`
                    })
            })
    }

}

