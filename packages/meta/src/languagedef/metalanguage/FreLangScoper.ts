import {
    FreMetaLangElement,
    FreMetaClassifier,
    FreMetaLanguage,
    FreLangAppliedFeatureExp,
    FreMetaPrimitiveType, FreMetaLimitedConcept
} from "./internal";
import { MetaLogger } from "../../utils/MetaLogger";
import { FreMetaDefinitionElement } from "../../utils";

const LOGGER = new MetaLogger("FreLangScoper"); // .mute();
// const anyElement = "_$anyElement";

export interface FreMetaScoper {
    getFromVisibleElements(owner: FreMetaDefinitionElement, name: string, typeName: string): FreMetaLangElement | undefined;
}

export class FreLangScoper {
    public language: FreMetaLanguage;
    extraScopers: FreMetaScoper[] = [];

    public getFromVisibleElements(owner: FreMetaDefinitionElement, name: string, typeName: string): FreMetaLangElement | undefined {
        let result: FreMetaLangElement | undefined;
        if (typeName === "FrePrimitiveType" ) {
            result = FreMetaPrimitiveType.find(name);
        } else if (typeName === "FreConcept" || typeName === "FreLimitedConcept" || typeName === "FreExpressionConcept" || typeName === "FreBinaryExpressionConcept") {
            result = this.language.findConcept(name);
        } else if (typeName === "FreUnitDescription" ) {
            result = this.language.findUnitDescription(name);
        } else if (typeName === "FreInterface" ) {
            result = this.language.findInterface(name);
        } else if (typeName === "FreClassifier" ) {
            result = this.language.findClassifier(name);
        } else if (typeName === "FreProperty" || typeName === "FrePrimitiveProperty" || typeName === "FreConceptProperty") {
            if (owner instanceof FreLangAppliedFeatureExp) {
                const xx = owner.sourceExp.$referredElement?.referred;
                if (!(!!xx)) {
                    LOGGER.error(`Incorrect use of applied feature, source expression has unknown reference: '${owner.sourceExp.sourceName}'.`);
                }
                if (!!xx && xx instanceof FreMetaClassifier) {
                    result = xx.allProperties().filter(prop => prop.name === name)[0];
                }
            }
        } else if (typeName === "FreInstance" ) {
            this.language.concepts.filter(c => c instanceof FreMetaLimitedConcept).forEach(lim => {
                const tmp = (lim as FreMetaLimitedConcept).findInstance(name);
                if (!!tmp) {
                    result = tmp;
                }
            });
        }
        if (!result) { // try the scoper for another meta language (e.g. typer)
            for (const scoper of this.extraScopers) {
                const xxx = scoper.getFromVisibleElements(owner, name, typeName);
                if (!!xxx) {
                    result = xxx;
                }
            }
        }
        return result;
    }

}
