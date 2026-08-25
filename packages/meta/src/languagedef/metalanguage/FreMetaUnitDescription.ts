import { FreMetaClassifier, FreMetaInterface, FreMetaProperty, FreMetaConceptProperty, FreMetaPrimitiveProperty, MetaElementReference } from "./internal.js"

export class FreMetaUnitDescription extends FreMetaClassifier {
    interfaces: MetaElementReference<FreMetaInterface>[] = [] // the interfaces that this concept implements

    fileExtension: string = ""
    isPublic: boolean = true

    /**
     * Returns a list of properties that are either (1) defined in this concept or (2) in one of the interfaces
     * that is implemented by this concept. Excluded are properties that are defined in an interface but are already
     * included in one of the base concepts.
     */
    implementedPrimProperties(): FreMetaPrimitiveProperty[] {
        let result: FreMetaPrimitiveProperty[] = [] // return a new array!
        result.push(...this.primProperties)
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allPrimProperties()) {
                let allreadyIncluded = false
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.primProperties.some((p) => p.name === intfProp.name)
                // TODO The next lines are only needed if units can have other units as base classes
                // if the prop from the interface is present in the base of this concept (resursive), do not include
                // if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                //     allreadyIncluded = this.base.referred.allPrimProperties().some(p => p.name === intfProp.name);
                // }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some((p) => p.name === intfProp.name)
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp)
                }
            }
        }
        return result
    }

    allPrimProperties(): FreMetaPrimitiveProperty[] {
        return this.implementedPrimProperties()
    }

    allReferences(): FreMetaConceptProperty[] {
        return this.implementedReferences()
    }

    allParts(): FreMetaConceptProperty[] {
        return this.implementedParts()
    }

    implementedParts(): FreMetaConceptProperty[] {
        let result: FreMetaConceptProperty[] = this.parts()
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allParts()) {
                let allreadyIncluded = false
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.parts().some((p) => p.name === intfProp.name)
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some((p) => p.name === intfProp.name)
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp)
                }
            }
        }
        return result
    }

    implementedReferences(): FreMetaConceptProperty[] {
        let result: FreMetaConceptProperty[] = this.references()
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allReferences()) {
                let allreadyIncluded = false
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.references().some((p) => p.name === intfProp.name)
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some((p) => p.name === intfProp.name)
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp)
                }
            }
        }
        return result
    }

    implementedProperties(): FreMetaProperty[] {
        let result: FreMetaProperty[] = []
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedReferences())
        return result
    }
}
