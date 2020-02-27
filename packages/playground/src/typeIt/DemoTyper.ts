import { DemoAbsExpression, DemoAttributeType, DemoBinaryExpression, 
    DemoComparisonExpression, DemoEntity, DemoIfExpression, DemoNumberLiteralExpression, DemoStringLiteralExpression } from "../language";
import { DemoModelElement } from "../scopeIt/DemoModelElement";


export type DemoType = DemoEntity | DemoAttributeType; // alle namen gemerkt met @isType

export interface Typer {
    inferType(modelelement: DemoModelElement) : DemoType;

    conform(type1: DemoType, type2: DemoType) : boolean; // type 1 <= type 2 conformance direction
    conformList(typelist1: DemoType[], typelist2: DemoType[]) : boolean;  

    isType(elem : DemoModelElement) : boolean;
    typeName(elem : DemoType): string; 
}

export class DemoTyper implements Typer {

    inferType(modelelement: DemoModelElement): DemoType {
        // generate if statement for all lang elements that have @hasType annotation
        // the result should be according to the @inferType rules
        if (this.isType(modelelement)) {
            return modelelement as DemoType;
        } else if (modelelement instanceof DemoStringLiteralExpression) {
            return DemoAttributeType.String;
        } else if (modelelement instanceof DemoNumberLiteralExpression) {
            return DemoAttributeType.Integer;
//        } else if (modelelement instanceof DemoBooleanLiteralExpression) {
//            return DemoAttributeType.Boolean;
        } else if (modelelement instanceof DemoComparisonExpression) { // moet voor zijn parent staan om deze te overriden!
            return DemoAttributeType.Boolean;
        } else if (modelelement instanceof DemoBinaryExpression) {
            return this.inferType(modelelement.left);
            // @inferType = commonSuperType(this.left.type, this.right.type)
        } else if (modelelement instanceof DemoAbsExpression) {
            return this.inferType(modelelement.expr);
    //    } else if (modelelement instanceof DemoVariableRef) {
    //        return modelelement.referredName.type;
    //    } else if (modelelement instanceof DemoFunctionCallExpression) {
    //        return modelelement.functionDefinition.name;
        } else if (modelelement instanceof DemoIfExpression) {
            return this.inferType(modelelement.whenTrue);
        }
        return DemoAttributeType.Any; // default
    }    

    // for now: simply implemented on basis of equal identity of the types
    // should be implemented based on the conformance rules in Typer Description file
    conform(type1: DemoType, type2: DemoType): boolean {
        if( type1.$id === type2.$id) return true;
        return false;
    }

    conformList(typelist1: DemoType[], typelist2: DemoType[]): boolean {
        if (typelist1.length !== typelist2.length) return false;
        let result : boolean = true;
        for (let index in typelist1) {
            result = this.conform(typelist1[index], typelist2[index]);
            if (result == false) return result;
        }
        return result;
    }

    isType(elem: DemoModelElement): boolean { // ook hier alle namen gemerkt met @isType
        if (elem instanceof DemoEntity) {
            return true;
        } else if (elem instanceof DemoAttributeType) {
            return true;
        }
        return false;
    }

    typeName(elem: DemoType): string { 
        if (elem instanceof DemoEntity) return elem.name;
        if (elem instanceof DemoAttributeType) return elem.name;
    }
}