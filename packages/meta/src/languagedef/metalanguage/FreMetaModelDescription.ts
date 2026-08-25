import { FreMetaClassifier, FreMetaUnitDescription } from "./internal.js"

export class FreMetaModelDescription extends FreMetaClassifier {
    isPublic: boolean = true
    version: string = "1"

    unitTypes(): FreMetaUnitDescription[] {
        let result: FreMetaUnitDescription[] = []
        // all parts of a model are units
        for (const intf of this.parts()) {
            result = result.concat(intf.type as FreMetaUnitDescription)
        }
        return result
    }
}
