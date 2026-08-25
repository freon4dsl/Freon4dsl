import { FreMetaProperty, FreMetaPrimitiveValue } from "./internal.js"

export class FreMetaPrimitiveProperty extends FreMetaProperty {
    isStatic: boolean = false
    initialValueList: FreMetaPrimitiveValue[] = []

    get isPrimitive(): boolean {
        return true
    }

    get initialValue(): FreMetaPrimitiveValue {
        return this.initialValueList[0]
    }

    set initialValue(value: FreMetaPrimitiveValue) {
        this.initialValueList[0] = value
    }
}
