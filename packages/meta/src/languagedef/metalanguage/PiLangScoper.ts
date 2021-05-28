import { PiLangElement, PiClassifier, PiConcept, PiConceptProperty, PiInterface, PiLanguage, PiProperty, PiLangAppliedFeatureExp } from "./internal";
import { MetaLogger } from "../../utils/MetaLogger";

const LOGGER = new MetaLogger("PiLangScoper"); // .mute();
const anyElement = "_$anyElement";

export class PiLangScoper {
    public language: PiLanguage;

    public getFromVisibleElements(owner: PiLangElement, name: string, typeName: string): PiLangElement {
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
                const xx = owner.sourceExp.referredElement?.referred;
                if (!(!!xx)) {
                    LOGGER.error(this, `Incorrect use of applied feature, source expression has unknown reference: '${owner.sourceExp.sourceName}'.`);
                }
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
