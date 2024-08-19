import {
    FreMetaClassifier,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
} from "../../languagedef/metalanguage/index.js";

export class ValidationUtils {
    public static findLocationDescription(concept: FreMetaClassifier | undefined): string {
        let nameProp: FreMetaPrimitiveProperty | undefined = concept
            ?.allPrimProperties()
            .find((prop) => prop.name === "name");
        if (!!!nameProp) {
            nameProp = concept?.allPrimProperties().find((prop) => prop.type === FreMetaPrimitiveType.identifier);
        }
        return !!nameProp ? `modelelement.${nameProp.name}` : `'unnamed'`;
    }
}
