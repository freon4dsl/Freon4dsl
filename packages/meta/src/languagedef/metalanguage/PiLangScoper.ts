import { PiLangElement } from "./PiLanguage";
import { PiClassifier, PiConcept, PiConceptProperty, PiInterface, PiLanguage, PiProperty } from "./PiLanguage";
import { PiLangAppliedFeatureExp } from "./PiLangExpressions";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiLangScoper"); // .mute();
const anyElement = "_$anyElement";

export class PiLangScoper {
    public language: PiLanguage;
    // TODO make searchlist a map {owner, unitName}
    private searchList: string[] = [];

    public getFromVisibleElements(owner: PiLangElement, name: string, typeName: string): PiLangElement {
        // check whether we are already searching for a this unitName
        if (this.searchingFor(name)) {
            return null;
        }

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
        this.cleanSearchList(name);
        return result;
    }

    /**
     * Returns true if a search is already in progress for 'unitName'
     * @param name
     */
    private searchingFor(name?: string): boolean {
        const myName: string = !!name ? name : anyElement;
        if (this.searchList.includes(myName)) {
            return true;
        } else {
            this.searchList.push(myName);
        }
        return false;
    }

    /**
     * Removes the 'metatype' from the list of searches that are in progress
     * @param name
     */
    private cleanSearchList(name?: string) {
        const type: string = !!name ? name : anyElement;
        const index = this.searchList.indexOf(type);
        if (index > -1) {
            this.searchList.splice(index, 1);
        }
    }
}
