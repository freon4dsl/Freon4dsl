import { FreMetaProperty, FreMetaPrimitiveValue } from "./internal.js"

export class FreMetaConceptProperty extends FreMetaProperty {
    // TODO Is never set , why the comment?
    hasLimitedType: boolean = false // set in checker
    initial: FreMetaPrimitiveValue | undefined
}
