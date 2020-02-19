import { DemoModel, DemoModelElement, DemoEntity, DemoFunction, DemoAttribute, DemoVariable, DemoAttributeType } from "../model";
import { model } from "@projectit/model";
import * as expressionExtensions from "./../editor/DemoExpression";
import { PiLogger } from "@projectit/core";

const LOGGER = new PiLogger("DemoScoper").mute();

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
       // from modelelement get its surrounding namespace
        let ns = this.getSurroundingNamespace(modelelement);
        while (ns !== null) {
            // get all visible elements from this namespace
            result = Array.from(ns.getVisibleElements().values()); 
        }                  
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
         let ns = this.getSurroundingNamespace(modelelement);
         while (ns !== null) {
             // get all visible elements from this namespace
             result = Array.from(ns.getVisibleElements().keys());            
         }
         return result;
     }

    getVisibleTypes(modelelement: DemoModelElement) : DemoEntity[] {
        let result : DemoEntity[] = [];
        result.push(new DemoEntity());
        return result;
    }

    private getSurroundingNamespace(modelelement: DemoModelElement) : NameSpace {
        if(modelelement == null){
            LOGGER.log("getSurroundingNamespace: modelelement is null");
            return null;
        } else {
            LOGGER.log("getSurroundingNamespace: working on modelelement " + modelelement.$id);
        }
        if (this.isNameSpace(modelelement)) {
            LOGGER.log("found NAMESPACE " + modelelement.$id);
            return new NameSpace(modelelement);
        } else {
            LOGGER.log("call getSurroundingNamespace recursive for " + modelelement.$id);
            this.getSurroundingNamespace(modelelement.piContainer().container as DemoModelElement);
        }
        return null;
    }

    private isNameSpace(modelelement : DemoModelElement) : boolean {
        LOGGER.log("checking for NAMESPACE " + modelelement.$id);
        // generate if-statement for each @namespace annotation!
        if (modelelement instanceof DemoModel ) {
            return true;
        } else if (modelelement instanceof DemoEntity ) {
            return true;
        } else if ( modelelement instanceof DemoFunction ) {
            return true;
        }
       return false;
    }
}

// probably no need to implement Scoper
export class NameSpace {
    _myElem : DemoModelElement;

    constructor(elem : DemoModelElement) {
        this._myElem = elem;
    }

   getVisibleElements(): Map<String,DemoModelElement> {
        let result : Map<String,DemoModelElement> = new Map();
        
        if (this._myElem instanceof DemoModel ) {
            // for now
            for (let z of this._myElem.entities) {
                result.set(z.name, z);
            }
            for (let z of this._myElem.functions) {
                result.set(z.name, z);
            }
        } else if (this._myElem instanceof DemoEntity ) {
            // for now
            for (let z of this._myElem.attributes) {
                result.set(z.name, z);
            }
            for (let z of this._myElem.functions) {
                result.set(z.name, z);
            }
        } else if ( this._myElem instanceof DemoFunction ) {
            // for now
            for (let z of this._myElem.parameters) {
                result.set(z.name, z);
            }
        }
        // walk up the tree and add the visible elements of every surrounding namespace
        return result;
    }
}