import { PiTyper } from "@projectit/core";
import { DemoAbsExpression, DemoAttributeType, DemoBinaryExpression, DemoComparisonExpression,
    DemoEntity, DemoIfExpression, DemoNumberLiteralExpression, DemoStringLiteralExpression, DemoType, DemoVariableRef, DemoFunctionCallExpression } from "../language";
import { AllDemoConcepts } from "../language/AllDemoConcepts";

export class DemoTyper implements PiTyper {
   
    equalsType(elem1: AllDemoConcepts, elem2: AllDemoConcepts): boolean {
        if( this.inferType(elem1).$id === this.inferType(elem2).$id) return true;
        // console.log("EQUALSTYPE( " + this.inferType(elem1).name + ", " + this.inferType(elem2).name + " ) returns false");
        return false;
    }

    inferType(modelelement: AllDemoConcepts): DemoType {
        // generate if statement for all lang elements that have @hasType annotation
        // the result should be according to the @inferType rules
        // i.e. every @hasType annotated elem should have an @inferType rule
        if (this.isType(modelelement)) {
            return modelelement as DemoType;
        } else if (modelelement instanceof DemoStringLiteralExpression) {
            return DemoAttributeType.String;
        } else if (modelelement instanceof DemoNumberLiteralExpression) {
            return DemoAttributeType.Integer;
        // } else if (modelelement instanceof DemoBooleanLiteralExpression) {
        //    return DemoAttributeType.Boolean;
        // moet voor zijn parent staan om deze te overriden!
        } else if (modelelement instanceof DemoComparisonExpression) { 
            return DemoAttributeType.Boolean;
        } else if (modelelement instanceof DemoBinaryExpression) {
            return this.inferType(modelelement.left);
            // @inferType = commonSuperType(this.left.type, this.right.type)
        } else if (modelelement instanceof DemoAbsExpression) {
            return this.inferType(modelelement.expr);
       } else if (modelelement instanceof DemoVariableRef) {
            return null;
        //    return modelelement.referredName.type;
       } else if (modelelement instanceof DemoFunctionCallExpression) {
           return null;
        //    return modelelement.functionDefinition.name;
        } else if (modelelement instanceof DemoIfExpression) {
            return this.inferType(modelelement.whenTrue);
        }
        return DemoAttributeType.ANY; // default
    }    

    // for now: simply implemented on basis of equal identity of the types
    // should be implemented based on the conformance rules in Typer Description file
    conformsTo(type1: DemoType, type2: DemoType): boolean {
        // @conformanceRule 'entityRule1' e1:PG_Entity <= e2:PG_Entity { // meaning that Entity e2 conforms to Entity e1 if the following holds
        //     e2.inheritsFrom(e1) // needs inheritance relationship between PG_Entities in .lang, this is currently not defined
        //     or 
        //     e2.attributes.equals(e1.attributes) // effectively, only this condition will be tested
        // }
        // if( type1 instanceof DemoEntity && type2 instanceof DemoEntity ) {
        //     // for now, check only if there is a name of an attribute that is the same on both types
        //     // TODO implement conformanceRule completely
        //     for( let attr1 of type1.attributes ) {
        //         for( let attr2 of type2.attributes ) {
        //             return attr1.name === attr2.name;
        //         }
        //     }
        // }
        if( type1.$id === type2.$id) return true;
        return false;
    }

    conformList(typelist1: DemoType[], typelist2: DemoType[]): boolean {
        if (typelist1.length !== typelist2.length) return false;
        let result : boolean = true;
        for (let index in typelist1) {
            result = this.conformsTo(typelist1[index], typelist2[index]);
            if (result == false) return result;
        }
        return result;
    }

    isType(elem: AllDemoConcepts): boolean { // ook hier alle namen gemerkt met @isType
        if (elem instanceof DemoEntity) {
            return true;
        } else if (elem instanceof DemoAttributeType) {
            return true;
        }
        return false;
    }

}
