// the basic types in the Fre-languages
import { FreMetaEnumValue, FreMetaConcept } from "./internal.js"

export type FreMetaPrimitiveValue = string | boolean | number | FreMetaEnumValue

export class FreMetaPrimitiveType extends FreMetaConcept {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FreMetaPrimitiveType>): FreMetaPrimitiveType {
        const result = new FreMetaPrimitiveType()
        if (!!data.name) {
            result.name = data.name
        }
        return result
    }

    static string: FreMetaPrimitiveType = FreMetaPrimitiveType.create({ name: "string" })
    static number: FreMetaPrimitiveType = FreMetaPrimitiveType.create({ name: "number" })
    static boolean: FreMetaPrimitiveType = FreMetaPrimitiveType.create({ name: "boolean" })
    static identifier: FreMetaPrimitiveType = FreMetaPrimitiveType.create({ name: "identifier" })
    static $freAny: FreMetaPrimitiveType // default predefined instance

    static find(name: string) {
        switch (name) {
            case "string":
                return this.string
            case "boolean":
                return this.boolean
            case "identifier":
                return this.identifier
            case "number":
                return this.number
        }
        return this.$freAny
    }

    allSubConceptsRecursive(): FreMetaConcept[] {
        return []
    }
    allSubConceptsDirect(): FreMetaConcept[] {
        return []
    }
}
