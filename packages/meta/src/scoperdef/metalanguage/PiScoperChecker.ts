import { Checker } from "../../utils/Checker";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "./PiScopeDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

export class PiScoperChecker extends Checker<PiScopeDef> {
    
    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
    }

    public check(definition: PiScopeDef): void {
        console.log("Checking Scope Definition " + definition.scoperName);
        this.nestedCheck(
            {
                check: true,
                error: "This error never happens"
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

