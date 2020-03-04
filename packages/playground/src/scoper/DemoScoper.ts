import { DemoAttribute, DemoEntity, DemoFunction, DemoVariable, DemoModel, IDemoScoper, AllDemoConcepts } from "../language/index"
import { DemoNameSpace } from "./DemoNamespace";
import { DemoConceptType } from "../language/Demo";

export class DemoScoper implements IDemoScoper {
    isInScope(modelElement: AllDemoConcepts, name: string, metatype?: DemoConceptType, excludeSurrounding? : boolean) : boolean {
        if (this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null) {
            return true;
        } else {
            return false;
        }
    }

    getVisibleElements(modelelement: AllDemoConcepts, metatype?: DemoConceptType, excludeSurrounding? : boolean): AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];
        if(modelelement == null){
            // TODO error mess console.log("getVisibleElements: modelelement is null");
            return null;
        }
        // TODO use metatype
        let ns = new DemoNameSpace(modelelement);
        result = ns.getVisibleElements(excludeSurrounding); // true means that we are excluding names from parent namespaces                   
        return result;
    }

    getFromVisibleElements(modelelement: AllDemoConcepts, name : string, metatype?: DemoConceptType, excludeSurrounding? : boolean) : AllDemoConcepts {
        let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        if (vis !== null) {
            for (let e of vis) {
                let n: string = this.getNameOfConcept(e);
                if (name === n) {
                    if (metatype) { 
                        if (e.$type === metatype) {   
                            return e; 
                        }
                    } else {
                        return e;
                    } 
                }  
            }
        }    
        return null;
    }

    getVisibleNames(modelelement: AllDemoConcepts, metatype?: DemoConceptType, excludeSurrounding? : boolean) : String[] {
        let result: String[] = [];
        let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
        for (let e of vis) {
            let n: string = this.getNameOfConcept(e);
            result.push(n);
        }
        return result;
    }

    private getNameOfConcept(modelelement: AllDemoConcepts) {
        let name: string = ""
        modelelement.propertyName
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