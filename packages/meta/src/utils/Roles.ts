import { PiClassifier, PiConcept, PiProperty } from "../languagedef/metalanguage";
import { Names } from "./Names";

export class Roles {

    public static elementName(concept: PiClassifier): string {
        return Names.classifier(concept);
    }

    public static property(property: PiProperty): string {
        return Roles.elementName(property.owningConcept) + "-" + property.name;
    }

    public static newPart(property: PiProperty): string {
        return Roles.property(property);
    }

    public static newConceptPart(concept: PiConcept, property: PiProperty): string {
        return Roles.elementName(concept) + "-" + property.name;
    }

}
