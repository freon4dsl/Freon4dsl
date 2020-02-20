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
        if ( ns !== null ) { 
            result = ns.internalVis(); 
            // now add elements from surrounding Namespaces
            if ( this._myElem.piContainer() !== null ) {
                if (this._myElem.piContainer().container !== null) {
                    if (this._myElem.piContainer().container instanceof DemoModelElement) {
                        let sns = this.getSurroundingNamespace((this._myElem.piContainer().container as DemoModelElement));
                            if ( sns !== null) {
                                // merge the results
                                for (let key of sns.internalVis()) { 
                                    result.push(key);
                                }    
                                // end merge
                        }
                    }
                }
            }
        } 
        return result;
    }

    private internalVis(): DemoModelElement[] {
        let result : DemoModelElement[] = [];
        
        if (this._myElem instanceof DemoModel ) {
            // for now
            for (let z of this._myElem.entities) {
                result.push(z);
            }
            for (let z of this._myElem.functions) {
                result.push(z);
            }
        } else if (this._myElem instanceof DemoEntity ) {
            // for now
            for (let z of this._myElem.attributes) {
                result.push(z);
            }
            for (let z of this._myElem.functions) {
                result.push(z);
            }
        } else if ( this._myElem instanceof DemoFunction ) {
            // for now
            for (let z of this._myElem.parameters) {
                result.push(z);
            }
        }
        // walk up the tree and add the visible elements of every surrounding namespace
        return result;
    }

    private getSurroundingNamespace(modelelement: DemoModelElement) : NameSpace {
        if(modelelement === null){
            LOGGER.log("getSurroundingNamespace: modelelement is null");
            return null;
        }
        if (this.isNameSpace(modelelement)) {
            return new NameSpace(modelelement);
        } else {
            LOGGER.log("call getSurroundingNamespace recursive for " + modelelement.$id);
            return this.getSurroundingNamespace(modelelement.piContainer().container as DemoModelElement);
        }
    }

    private isNameSpace(modelelement : DemoModelElement) : boolean {
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