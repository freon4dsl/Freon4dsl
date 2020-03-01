import { DemoAttribute, DemoEntity, DemoFunction, DemoVariable, DemoModel, WithType, DemoExpression, DemoPlaceholderExpression, DemoLiteralExpression, DemoStringLiteralExpression, DemoNumberLiteralExpression, DemoAbsExpression, DemoBinaryExpression, DemoMultiplyExpression, DemoPlusExpression, DemoDivideExpression, DemoAndExpression, DemoOrExpression, DemoComparisonExpression, DemoLessThenExpression, DemoGreaterThenExpression, DemoEqualsExpression, DemoFunctionCallExpression, DemoIfExpression, DemoVariableRef, DemoAttributeType} from "../language/index"
import { AllDemoConcepts } from "language/AllDemoConcepts";
import { IDemoScoper } from "language/IDemoScoper";
import { DemoNameSpace } from "./DemoNamespace";
import { DemoConceptType } from "language/Demo";

export class DemoScoper implements IDemoScoper {
    isInScope(modelElement: AllDemoConcepts, name: string, type?: DemoConceptType) : boolean {
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
        let ns = new DemoNameSpace(modelelement);
        result = ns.getVisibleElements(true); // true means that we are including names from parent namespaces                   
        return result;
    }

    getFromVisibleElements(modelelement: AllDemoConcepts, name : string, metatype?: DemoConceptType) : AllDemoConcepts {
        let vis = this.getVisibleElements(modelelement);
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

    getVisibleNames(modelelement: AllDemoConcepts) : String[] {
        let result: String[] = [];
        let vis = this.getVisibleElements(modelelement);
        for (let e of vis) {
            let n: string = this.getNameOfConcept(e);
            result.push(n);
        }
        return result;
    }

    getVisibleTypes(modelelement: AllDemoConcepts): AllDemoConcepts[] {
        let result : AllDemoConcepts[] = [];
        // TODO
        return result;
    }

    private getNameOfConcept(modelelement: AllDemoConcepts) {
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