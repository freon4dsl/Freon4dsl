import { FreMetaLangElement, MetaElementReference, FreMetaInstance, FreMetaProperty } from "./internal.js"

import { FreMetaPrimitiveValue } from "./FreMetaPrimitives.js"

export class FreMetaInstanceProperty extends FreMetaLangElement {
    // @ts-ignore
    owningInstance: MetaElementReference<FreMetaInstance>
    // @ts-ignore
    property: MetaElementReference<FreMetaProperty>
    valueList: FreMetaPrimitiveValue[] = []

    get value(): FreMetaPrimitiveValue {
        return this.valueList[0]
    }

    set value(newV) {
        this.valueList[0] = newV
    }
}
