import { DemoModel, DemoModelElement, DemoEntity, DemoFunction, DemoAttribute, DemoVariable, DemoAttributeType } from "../model";
import { model } from "@projectit/model";
import * as expressionExtensions from "./../editor/DemoExpression";
import { PiLogger } from "@projectit/core";
import { map } from "mobx";

const LOGGER = new PiLogger("DemoScoper"); //.mute();

// do we need this interface? We could simple generate the class below ...
export interface Scoper {
    isInScope(modelElement: DemoModelElement, name: string, type?: DemoEntity) : boolean;
    getVisibleElements(modelelement: DemoModelElement) : DemoModelElement[] ;
    getFromVisibleElements(modelelement: DemoModelElement, name : string, metatype?: DemoModelElement) : DemoModelElement;
    getVisibleNames(modelelement: DemoModelElement) : String[] ;
    getVisibleTypes(modelelement: DemoModelElement) : DemoModelElement[] ;
}

export class DemoScoper implements Scoper {

    isInScope(modelElement: DemoModelElement, name: string, type?: DemoEntity) : boolean {
        return true;
    }

    getVisibleElements(modelelement: DemoModelElement) : DemoModelElement[] {
       let result : DemoModelElement[] = [];
       if(modelelement == null){
            LOGGER.log("getVisibleElements: modelelement is null");
            return null;
        } else {
            LOGGER.log("getVisibleElements: working on modelelement " + modelelement.$id);
        }
        let ns = new NameSpace(modelelement);
        result = ns.getVisibleElements();                   
        return result;
    }

    getFromVisibleElements(modelelement: DemoModelElement, name : string, type?: DemoModelElement) : DemoModelElement {
        let vis = this.getVisibleElements(modelelement);
        if (vis !== null) {
            for (let v of vis) {
                if (v instanceof DemoAttribute) {  
                    if (v.name == name)  {
                        if (type !== null) {
    //                        if ( (v.type as DemoAttributeType) == type) { return v; }
                        } else { 
                            return v;
                        }
                    }
                }
                else if (v instanceof DemoEntity) {
                    if (v.name == name) return v;
                }
                else if (v instanceof DemoFunction) {
                    if (v.name == name) return v;
                }
                else if (v instanceof DemoVariable) {
                    if (v.name == name) return v;
                }
                else if (v instanceof DemoModel) {
                    if (v.name == name) return v;
                }
                else {
                    LOGGER.log(v.$id);
                    return null;
                }
            }
        }
     
        return new DemoEntity();
    }

    getVisibleNames(modelelement: DemoModelElement) : String[] {
        let result: String[] = [];
        if(modelelement == null){
             LOGGER.log("getVisibleNames: modelelement is null");
             return null;
         } else {
             LOGGER.log("getVisibleNames: working on modelelement " + modelelement.$id);
         }
        // from modelelement get its surrounding namespace
        let ns = new NameSpace(modelelement);
        //TODO
        //result = Array.from(ns.getVisibleElements().keys());            
        return result;
     }

    getVisibleTypes(modelelement: DemoModelElement) : DemoEntity[] {
        let result : DemoEntity[] = [];
        // TODO
        result.push(new DemoEntity());
        return result;
    }
}

// probably no need to implement Scoper
export class NameSpace {
    _myElem : DemoModelElement;

    constructor(elem : DemoModelElement) {
        this._myElem = elem;
    }

    getVisibleElements() : DemoModelElement[] {
        let result : DemoModelElement[] = [];
        // from modelelement get its surrounding namespace
        let ns = this.getSurroundingNamespace(this._myElem);
        if (ns !== null) {
            result = ns.internalVis(); 
        }
        // now add elements from surrounding Namespaces
        let parent: DemoModelElement = this.getParent(this._myElem);
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

    private getParent(modelelement : DemoModelElement) : DemoModelElement {
        let parent: DemoModelElement = null;
        if (modelelement.piContainer() !== null) {
            if (modelelement.piContainer().container !== null) {
                if (modelelement.piContainer().container instanceof DemoModelElement) {
                    parent = (modelelement.piContainer().container as DemoModelElement);
                }
            }
        }
        return parent;
    }

    private internalVis(): DemoModelElement[] {
        let result : DemoModelElement[] = [];

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

    private getSurroundingNamespace(modelelement: DemoModelElement) : NameSpace {
        if(modelelement === null){
            return null;
        }
        if (this.isNameSpace(modelelement)) {
            return new NameSpace(modelelement);
        } else {
             return this.getSurroundingNamespace(this.getParent(modelelement));
        }
    }

    private isNameSpace(modelelement : DemoModelElement) : boolean {
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