import { DemoAttributeType, DemoEntity, DemoModelElement, DemoNumberLiteralExpression, DemoStringLiteralExpression, DemoAttribute, DemoBinaryExpression, DemoAbsExpression, DemoVariableRefExpression, DemoFunctionCallExpression, DemoIfExpression, DemoComparisonExpression } from "../model";

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
        if (this.isType(modelelement)) {
            return modelelement as DemoType;
        } else if (modelelement instanceof DemoStringLiteralExpression) {
            return DemoAttributeType.String;
        } else if (modelelement instanceof DemoNumberLiteralExpression) {
            return DemoAttributeType.Integer;
//        } else if (modelelement instanceof DemoBooleanLiteralExpression) {
//            return DemoAttributeType.Boolean;
        } else if (modelelement instanceof DemoComparisonExpression) { // moet voor zijn parent staan om dexe te overriden!
            return DemoAttributeType.Boolean;
        } else if (modelelement instanceof DemoBinaryExpression) {
            return this.inferType(modelelement.left);
        } else if (modelelement instanceof DemoAbsExpression) {
            return this.inferType(modelelement.expr);
        } else if (modelelement instanceof DemoVariableRefExpression) {
            return modelelement.refVariable.type;
        } else if (modelelement instanceof DemoFunctionCallExpression) {
            return modelelement.functionDefinition.type;
        } else if (modelelement instanceof DemoIfExpression) {
            return this.inferType(modelelement.thenExpression);
        }
        return DemoAttributeType.Any; // default
    }    

    // for now: simply implemented on basis of equal identity of the types
    conform(type1: DemoType, type2: DemoType): boolean {
        if( type1.equals(type2)) return true;
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

    typeName(elem: DemoType): string { // gebruik hier de var gemerkt met @typename
        if (elem instanceof DemoEntity) return elem.name;
        if (elem instanceof DemoAttributeType) return elem.asString();
    }
}