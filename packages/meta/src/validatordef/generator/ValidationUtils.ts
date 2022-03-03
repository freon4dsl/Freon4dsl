import { PiClassifier, PiPrimitiveType } from "../../languagedef/metalanguage";

export class ValidationUtils {
    public static findLocationDescription(concept: PiClassifier): string {
        let nameProp = concept.allPrimProperties().find(prop => prop.name === "name");
        if (!(!!nameProp)) {
            nameProp = concept.allPrimProperties().find(prop => prop.type === PiPrimitiveType.identifier);
        }
        const locationdescription = !!nameProp ? `modelelement.${nameProp.name}` : `'unnamed'`;
        return locationdescription;
    }
}
