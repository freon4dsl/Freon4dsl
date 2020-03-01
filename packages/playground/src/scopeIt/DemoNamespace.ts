import { AllDemoConcepts, DemoModel, DemoEntity, DemoFunction } from "../language";

export class DemoNameSpace {
    _myElem : AllDemoConcepts;

    constructor(elem : AllDemoConcepts) {
        this._myElem = elem;
    }

    public getVisibleElements(includeParent : boolean) : AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];
        // from modelelement get its surrounding namespace
        let ns = this.getSurroundingNamespace(this._myElem);
        if (ns !== null) {
            result = ns.internalVis(); 
        }
        if (includeParent) {
            // add elements from surrounding Namespaces
            let parent: AllDemoConcepts = this.getParent(this._myElem);
            while (parent !== null) { 
                ns = this.getSurroundingNamespace(parent);
                if (ns !== null) {
                    // merge the results
                    ns.internalVis().map( key => { 
                        result.push(key);
                    });
                }
                // skip modelelements between parent and the modelelement that is its surrounding namespace
                parent = this.getParent(ns._myElem);
            } 
        }
        return result;
    }

    private internalVis(): AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];

        // for now we push all parts, later public/private annotations need to be taken into account        
        if (this._myElem instanceof DemoModel ) {
            for (let z of this._myElem.entities) {
                result.push(z);
            }
            for (let z of this._myElem.functions) {
                result.push(z);
            }
        } else if (this._myElem instanceof DemoEntity ) {
            for (let z of this._myElem.attributes) {
                result.push(z);
            }
            for (let z of this._myElem.functions) {
                result.push(z);
            }
        } else if (this._myElem instanceof DemoFunction ) {
            for (let z of this._myElem.parameters) {
                result.push(z);
            }
        }
        return result;
    }

    private getSurroundingNamespace(modelelement: AllDemoConcepts) : DemoNameSpace {
        if(modelelement === null){
            return null;
        }
        if (this.isNameSpace(modelelement)) {
            return new DemoNameSpace(modelelement);
        } else {
             return this.getSurroundingNamespace(this.getParent(modelelement));
        }
    }

    private isNameSpace(modelelement : AllDemoConcepts) : boolean {
        // generate if-statement for each @namespace annotation!
        if (modelelement instanceof DemoModel) {
            return true;
        } else if (modelelement instanceof DemoEntity) {
            return true;
        } else if ( modelelement instanceof DemoFunction) {
            return true;
        }
       return false;
    }

    private getParent(modelelement : AllDemoConcepts) : AllDemoConcepts {
		// should be moved to PiElement
        let parent: AllDemoConcepts = null;
        if (modelelement.piContainer() !== null) {
            if (modelelement.piContainer().container !== null) {
                // if (modelelement.piContainer().container instanceof AllDemoConcepts) {
                    parent = (modelelement.piContainer().container as AllDemoConcepts);
                // }
            }
        }
        return parent;
    }

}
