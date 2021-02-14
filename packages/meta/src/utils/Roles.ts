import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiConceptProperty,
    PiProperty
} from "../languagedef/metalanguage";
import { Names } from "./Names";

export class Roles {

    public static elementVarName(concept: PiClassifier): string {
        return Names.classifier(concept).toLowerCase();
    }

    public static elementName(concept: PiClassifier): string {
        return Names.classifier(concept);//.toLowerCase();
    }

    public static property(property: PiProperty): string {
        return Roles.elementName(property.owningConcept) + "-" + property.name;
    }

    public static newPart(property: PiProperty): string {
        return Roles.newConceptPart(property.owningConcept, property)
        // return Roles.property(property);
    }

    public static newConceptPart(concept: PiClassifier, property: PiProperty): string {
        if( concept instanceof PiBinaryExpressionConcept) {
            if( !!(concept.base.referred) ){
                if( !(concept.base.referred instanceof PiBinaryExpressionConcept)){
                    return "PiBinaryExpression" + "-" + property.name;
                }
            }
        }
        return Names.classifier(concept) + "-" + property.name;
    }

    public static newConceptReferencePart(reference: PiConceptProperty): string {
        return reference.name;
    }

}
