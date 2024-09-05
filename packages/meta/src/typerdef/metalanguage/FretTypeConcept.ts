// Generated by the Freon Language Generator.
import {
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
} from "../../languagedef/metalanguage/index.js";
import { FretProperty } from "./FretProperty.js";

/**
 * Class FretTypeConcept is the implementation of the concept with the same name in the language definition file.
 */
export class FretTypeConcept extends FreMetaConcept {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretTypeConcept>): FretTypeConcept {
        const result = new FretTypeConcept();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.properties) {
            data.properties.forEach((x) => {
                if (x instanceof FretProperty) {
                    if (
                        x.typeReference.name === "boolean" ||
                        x.typeReference.name === "number" ||
                        x.typeReference.name === "string"
                    ) {
                        const newProp: FreMetaPrimitiveProperty = new FreMetaPrimitiveProperty();
                        newProp.name = x.name;
                        newProp.typeReference = x.typeReference;
                        result.primProperties.push(newProp);
                    } else {
                        result.properties.push(x);
                    }
                }
            });
        }
        if (!!data.base) {
            result.base = data.base;
        }
        // if (!!data.__base) {
        //     result.__base = data.__base;
        // }
        if (!!data.location) {
            result.location = data.location;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }

    readonly $typename: string = "FretTypeConcept"; // holds the metatype in the form of a string

    toFreString(): string {
        return (
            "type " +
            this.name +
            (!!this.base ? "base " + this.base.name : "") +
            " {\n\t" +
            this.properties.map((p) => p.toFreString()).join(";\n\t") +
            "\n} "
        );
    }

    parts(): FreMetaConceptProperty[] {
        return this.properties.filter(
            (prop) => !(prop.type instanceof FreMetaPrimitiveType),
        ) as FreMetaConceptProperty[];
    }
}
