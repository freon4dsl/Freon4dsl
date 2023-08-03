import { FreMetaClassifier, FreMetaPrimitiveType } from "../../languagedef/metalanguage";

export class ValidationUtils {
    public static findLocationDescription(concept: FreMetaClassifier): string {
        let nameProp = concept.allPrimProperties().find(prop => prop.name === "name");
        if (!(!!nameProp)) {
            nameProp = concept.allPrimProperties().find(prop => prop.type === FreMetaPrimitiveType.identifier);
        }
        return !!nameProp ? `modelelement.${nameProp.name}` : `'unnamed'`;
    }
}
