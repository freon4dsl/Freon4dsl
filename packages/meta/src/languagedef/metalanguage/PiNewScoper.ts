import { PiLangElement } from "./PiLangElement";
import { PiClassifier, PiConcept, PiConceptProperty, PiInterface, PiLanguageUnit, PiProperty } from "./PiLanguage";
import { PiLangAppliedFeatureExp } from "./PiLangExpressions";

export class PiNewScoper {
    public language: PiLanguageUnit;

    getFromVisibleElements(owner: PiLangElement, name: string, typeName: string) : PiLangElement {
        let result: PiLangElement;
        if (typeName === "PiConcept" || typeName === "PiExpressionConcept" || typeName === "PiBinaryExpressionConcept") {
            result = this.language.findConcept(name);
        } else
        if (typeName === "PiInterface" ) {
            result = this.language.findInterface(name);
        } else
        if (typeName === "PiClassifier" ) {
            result = this.language.findClassifier(name);
        } else
        if (typeName === "PiProperty" || typeName === "PiPrimitiveProperty" || typeName === "PiConceptProperty") {
            if (owner instanceof PiLangAppliedFeatureExp) {
                let xx = owner.sourceExp.referedElement.referred;
                if (!!xx && xx instanceof PiClassifier) {
                    result = xx.allProperties().filter(prop => prop.name === name)[0];
                }
            }
        } else {
            console.error("NO calculation found for " + name + ", owner: " + owner.name + ", type:" + typeName);
        }
        return result;
    }
}
