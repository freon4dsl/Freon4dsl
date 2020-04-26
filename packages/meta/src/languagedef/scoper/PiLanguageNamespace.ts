import { PiLangEveryConcept } from "../metalanguage/PiLangEveryConcept";
import { PiLangConceptType } from "../metalanguage/PiLangConceptType";
import { PiClassifier, PiConcept, PiFunction, PiInterface, PiLanguageUnit, PiProperty } from "../metalanguage";
import { PiLangElement } from "../metalanguage/PiLangElement";

export class PiLanguageNamespace {
    _myElem: PiLangEveryConcept; // any element in the model
    _searched: PiLangEveryConcept[] = [];

    constructor(elem: PiLangEveryConcept, searched?: PiLangEveryConcept[]) {
        this._myElem = elem;
        if (!!searched) {
            this._searched = searched;
        }
    }

    // if excludeSurrounding is true, then the elements from all parent namespaces are
    // not included in the result
    public getVisibleElements(metatype?: PiLangConceptType, excludeSurrounding?: boolean): PiLangElement[] {
        let result: PiLangElement[] = [];
        // from modelelement get its surrounding namespace
        let ns = this.getSurroundingNamespace(this._myElem);
        if (ns !== null) {
            result = ns.internalVis(metatype);
            this._searched.push(this._myElem);
            // add extra namespaces from the scope definition
            result = result.concat(this.addExtras(metatype, excludeSurrounding));
        }
        if (!(!(excludeSurrounding === undefined) && excludeSurrounding)) {
            // add elements from surrounding Namespaces
            let parent: PiLangEveryConcept = this.getParent(this._myElem);
            while (parent !== null) {
                ns = this.getSurroundingNamespace(parent);
                if (ns !== null) {
                    // join the results
                    ns.internalVis(metatype).forEach((elem) => {
                        // shadow name in outer namespace if it is already present
                        if (!result.includes(elem)) result.push(elem);
                    });
                }
                // skip modelelements between parent and the modelelement that is its surrounding namespace
                parent = this.getParent(ns._myElem);
            }
        }
        return result;
    }

    private internalVis(metatype?: PiLangConceptType): PiLangElement[] {
        let result: PiLangElement[] = [];

        // for now we push all parts, later public/private annotations can be taken into account
        if (this._myElem instanceof PiLanguageUnit) {
            for (let z of this._myElem.concepts) {
                this.addIfTypeOK(z, result, metatype);
            }
            for (let z of this._myElem.interfaces) {
                this.addIfTypeOK(z, result, metatype);
            }
        }
        if (this._myElem instanceof PiFunction) {
            for (let z of this._myElem.formalparams) {
                this.addIfTypeOK(z, result, metatype);
            }
        }
        if (this._myElem instanceof PiConcept) {
            for (let z of this._myElem.properties) {
                this.addIfTypeOK(z, result, metatype);
            }
            for (let z of this._myElem.primProperties) {
                this.addIfTypeOK(z, result, metatype);
            }
        }
        if (this._myElem instanceof PiInterface) {
            for (let z of this._myElem.properties) {
                this.addIfTypeOK(z, result, metatype);
            }
            for (let z of this._myElem.primProperties) {
                this.addIfTypeOK(z, result, metatype);
            }
        }
        if (this._myElem instanceof PiClassifier) {
            for (let z of this._myElem.properties) {
                this.addIfTypeOK(z, result, metatype);
            }
            for (let z of this._myElem.primProperties) {
                this.addIfTypeOK(z, result, metatype);
            }
        }

        return result;
    }

    private getSurroundingNamespace(modelelement: PiLangEveryConcept): PiLanguageNamespace {
        if (modelelement === null) {
            return null;
        }
        if (this.isNameSpace(modelelement)) {
            return new PiLanguageNamespace(modelelement);
        } else {
            return this.getSurroundingNamespace(this.getParent(modelelement));
        }
    }

    private isNameSpace(modelelement: PiLangEveryConcept): boolean {
        // if-statement generated for each concept marked with @namespace annotation!
        // if (modelelement instanceof PiCombined) return true;
        if (modelelement instanceof PiLanguageUnit) return true;
        if (modelelement instanceof PiFunction) return true;
        if (modelelement instanceof PiConcept) return true;
        if (modelelement instanceof PiInterface) return true;
        if (modelelement instanceof PiClassifier) return true;

        return false;
    }

    private getParent(modelelement: PiLangEveryConcept): PiLangEveryConcept {
        // should be moved to PiElement
        let parent: PiLangEveryConcept = null;
        if (modelelement instanceof PiClassifier) {
            parent = modelelement.language;
        } else if (modelelement instanceof PiProperty) {
            parent = modelelement.owningConcept;
        } else if (modelelement instanceof PiFunction) {
            parent = modelelement.language;
        // } else if (modelelement instanceof PiAppliedFeature) {
        //     parent = modelelement.source;
        }
        // if (modelelement.piContainer() !== null) {
        //     if (modelelement.piContainer().container !== null) {
        //         // if (modelelement.piContainer().container instanceof PiLangEveryConcept) {
        //         parent = modelelement.piContainer().container as PiLangEveryConcept;
        //         // }
        //     }
        // }
        return parent;
    }

    private addIfTypeOK(z: PiLangElement, result: PiLangElement[], metatype?: PiLangConceptType) {
        if (metatype) {
            // TODO enlarge this to include superclasses!
            // for now I use this hack:
            let myTypeName = z.constructor.name;
            if  (metatype === "PiExpressionConcept") {
                // all subclasses also ok
                if (myTypeName === metatype || myTypeName === "PiBinaryExpressionConcept") {
                    result.push(z);
                }
            } else
            if  (metatype === "PiConcept") {
                // all subclasses also ok
                if (myTypeName === metatype || myTypeName === "PiBinaryExpressionConcept" || myTypeName === "PiExpressionConcept" || myTypeName === "PiLimitedConcept") {
                    result.push(z);
                }
            } else
            if  (metatype === "PiClassifier") {
                // all subclasses also ok
                if (myTypeName === metatype || myTypeName === "PiBinaryExpressionConcept" || myTypeName === "PiExpressionConcept" ||
                    myTypeName === "PiLimitedConcept" || myTypeName === "PiConcept" || myTypeName === "PiInterface") {
                    result.push(z);
                }
            } else
            if  (metatype === "PiProperty") {
                // all subclasses also ok
                if (myTypeName === metatype || myTypeName === "PiConceptProperty" || myTypeName === "PiPrimitiveProperty" ) {
                    result.push(z);
                }
            } else
            if (z.constructor.name === metatype) {
                result.push(z);
            }
        } else {
            result.push(z);
        }
    }

    private addExtras(metatype?: PiLangConceptType, excludeSurrounding?: boolean): PiLangElement[] {
        let result: PiLangElement[] = [];
        // add names from other parts of the namespace definition
        if (this._myElem instanceof PiConcept) {
            // generated based on 'self.base'
            if (!!this._myElem.base) {
                if (!this._searched.includes(this._myElem.base.referred)) {
                    if (this.isNameSpace(this._myElem.base.referred)) {
                        // wrap the found element
                        let extraNamespace = new PiLanguageNamespace(this._myElem.base.referred, this._searched);
                        result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
                        this._searched.push(this._myElem.base.referred);
                    }
                }
            }
            // generated based on 'self.interfaces'
            for (let yy of this._myElem.interfaces) {
                if (!this._searched.includes(yy.referred)) {
                    if (this.isNameSpace(yy.referred)) {
                        // wrap the found element
                        let extraNamespace = new PiLanguageNamespace(yy.referred, this._searched);
                        result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
                        this._searched.push(yy.referred);
                    }
                }
            }
        }
        if (this._myElem instanceof PiInterface) {
            // generated based on 'self.base'
            for (let yy of this._myElem.base) {
                if (!this._searched.includes(yy.referred)) {
                    if (this.isNameSpace(yy.referred)) {
                        // wrap the found element
                        let extraNamespace = new PiLanguageNamespace(yy.referred, this._searched);
                        result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
                        this._searched.push(yy.referred);
                    }
                }
            }
        }
        return result;
    }
}
