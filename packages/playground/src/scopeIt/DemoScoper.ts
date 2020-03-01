import { DemoAttribute, DemoEntity, DemoFunction, DemoVariable, DemoModel, WithType, DemoExpression, DemoPlaceholderExpression, DemoLiteralExpression, DemoStringLiteralExpression, DemoNumberLiteralExpression, DemoAbsExpression, DemoBinaryExpression, DemoMultiplyExpression, DemoPlusExpression, DemoDivideExpression, DemoAndExpression, DemoOrExpression, DemoComparisonExpression, DemoLessThenExpression, DemoGreaterThenExpression, DemoEqualsExpression, DemoFunctionCallExpression, DemoIfExpression, DemoVariableRef, DemoAttributeType} from "../language/index"
import { AllDemoConcepts } from "language/AllDemoConcepts";

export interface Scoper {
    isInScope(modelElement: AllDemoConcepts, name: string, type?: DemoEntity) : boolean;
    getVisibleElements(modelelement: AllDemoConcepts) : AllDemoConcepts[] ;
    getFromVisibleElements(modelelement: AllDemoConcepts, name : string, metatype?: AllDemoConcepts) : AllDemoConcepts;
    getVisibleNames(modelelement: AllDemoConcepts) : String[] ;
    getVisibleTypes(modelelement: AllDemoConcepts) : AllDemoConcepts[] ;
}

export class DemoScoper implements Scoper {

    isInScope(modelElement: AllDemoConcepts, name: string, type?: DemoEntity) : boolean {
        if (this.getFromVisibleElements(modelElement, name, type) !== null) {
            return true;
        } else {
            return false;
        }
    }

    getVisibleElements(modelelement: AllDemoConcepts) : AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];
        if(modelelement == null){
            // TODO error mess console.log("getVisibleElements: modelelement is null");
            return null;
        }
        let ns = new NameSpace(modelelement);
        result = ns.getVisibleElements();                   
        return result;
    }

    getFromVisibleElements(modelelement: AllDemoConcepts, name : string, metatype?: AllDemoConcepts) : AllDemoConcepts {
        let vis = this.getVisibleElements(modelelement);
        if (vis !== null) {
            for (let e of vis) {
                let n: string = this.getNameOfDemoModelElement(e);
                if (name === n) {
                    if (metatype !== null) { // TODO check type
                        //if (e instanceof T) {   
                            return e; 
                        //}
                    } else {
                        return e;
                    }                                     
                }  
            }
        }    
        return null;
    }

    getVisibleNames(modelelement: AllDemoConcepts) : String[] {
        let result: String[] = [];
        if(modelelement == null){
            // TODO: error mess console.log("getVisibleNames: modelelement is null");
             return null;
        }
        // from modelelement get its surrounding namespace
        let ns = new NameSpace(modelelement);
        for (let e of ns.getVisibleElements()) {
            let name: string = this.getNameOfDemoModelElement(e);
            result.push(name);  
        }          
        return result;
    }

    getVisibleTypes(modelelement: AllDemoConcepts) : DemoEntity[] {
        let result : DemoEntity[] = [];
        // TODO
        result.push(new DemoEntity());
        return result;
    }

    private getNameOfDemoModelElement(modelelement: AllDemoConcepts) {
        let name: string = ""
        if (modelelement instanceof DemoAttribute) {
            name = modelelement.name;
        }
        else if (modelelement instanceof DemoEntity) {
            name = modelelement.name;
        }
        else if (modelelement instanceof DemoFunction) {
            name = modelelement.name;
        }
        else if (modelelement instanceof DemoVariable) {
            name = modelelement.name;
        }
        else if (modelelement instanceof DemoModel) {
            name = modelelement.name;
        }
        else {
            name = modelelement.$id;
        }
        return name;
    }

}

export class NameSpace {
    _myElem : AllDemoConcepts;

    constructor(elem : AllDemoConcepts) {
        this._myElem = elem;
    }

    getVisibleElements() : AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];
        // from modelelement get its surrounding namespace
        let ns = this.getSurroundingNamespace(this._myElem);
        if (ns !== null) {
            result = ns.internalVis(); 
        }
        // now add elements from surrounding Namespaces
        let parent: AllDemoConcepts = this.getParent(this._myElem);
        while (parent !== null) { 
            ns = this.getSurroundingNamespace(parent);
            if (ns !== null) {
                // merge the results
                for (let key of ns.internalVis()) { 
                    result.push(key);
                }
            }
            // skip modelelements between parent and the modelelement that is its surrounding namespace
            parent = this.getParent(ns._myElem);
        } 
        return result;
    }

    private getParent(modelelement : AllDemoConcepts) : AllDemoConcepts {
        let parent: AllDemoConcepts = null;
        if (modelelement.piContainer() !== null) {
            if (modelelement.piContainer().container !== null) {
                // if (modelelement.piContainer().container instanceof DemoModelElement) {
                    parent = (modelelement.piContainer().container as AllDemoConcepts);
                // }
            }
        }
        return parent;
    }

    private internalVis(): AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];

        // for now we push all parts, later public/private annotaiosn need to be taken into account        
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

    private getSurroundingNamespace(modelelement: AllDemoConcepts) : NameSpace {
        if(modelelement === null){
            return null;
        }
        if (this.isNameSpace(modelelement)) {
            return new NameSpace(modelelement);
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
}