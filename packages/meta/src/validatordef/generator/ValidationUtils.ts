import {
    FreMetaClassifier,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
} from "../../languagedef/metalanguage/index.js";
import { FreComparator } from '../metalanguage/index.js';
import { isNullOrUndefined } from "../../utils/file-utils/index.js"


export class ValidationUtils {
    public static findLocationDescription(concept: FreMetaClassifier | undefined, paramName: string): string {
        let nameProp: FreMetaPrimitiveProperty | undefined = concept
            ?.allPrimProperties()
            .find((prop) => prop.name === "name");
        if (isNullOrUndefined(nameProp)) {
            nameProp = concept?.allPrimProperties().find((prop) => prop.type === FreMetaPrimitiveType.identifier);
        }
        return !!nameProp ? `${paramName}.${nameProp.name}` : `'unnamed'`;
    }

    public static freComparatorToTypeScript(comparator: FreComparator | undefined): string {
        switch (comparator) {
            case FreComparator.Equals: return '===';
            case FreComparator.SmallerIncluding: return '<=';
            case FreComparator.LargerIncluding: return '>=';
            case FreComparator.LargerThen: return '>';
            case FreComparator.SmallerThen: return '<';
        }
        return '=== /* error: comparator undefined */';
    }
}
