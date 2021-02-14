import { PiConcept } from "../../languagedef/metalanguage";

export class ValidationUtils {
    public static findLocationDescription(concept: PiConcept): string {
        let nameProp = concept.allPrimProperties().find(prop => prop.name === "name");
        if (!(!!nameProp)) {
            nameProp = concept.allPrimProperties().find(prop => prop.primType === "string");
        }
        const locationdescription = !!nameProp ? `modelelement.${nameProp.name}` : `'unnamed'`;
        return locationdescription;
    }
}
