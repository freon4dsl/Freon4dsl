import { PiConcept } from "../../languagedef/metalanguage";
import { PiPrimitiveType } from "../../languagedef/metalanguage/PiLanguage";

export class ValidationUtils {
    public static findLocationDescription(concept: PiConcept): string {
        let nameProp = concept.allPrimProperties().find(prop => prop.name === "name");
        if (!(!!nameProp)) {
            nameProp = concept.allPrimProperties().find(prop => prop.type.referred === PiPrimitiveType.identifier);
        }
        const locationdescription = !!nameProp ? `modelelement.${nameProp.name}` : `'unnamed'`;
        return locationdescription;
    }
}
