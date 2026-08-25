import { FreMetaClassifier, MetaElementReference, FreMetaInterface, FreMetaProperty, FreMetaConceptProperty, FreMetaPrimitiveProperty } from "./internal.js"

export class FreMetaConcept extends FreMetaClassifier {
    isAbstract: boolean = false
    // @ts-ignore
    base: MetaElementReference<FreMetaConcept>
    interfaces: MetaElementReference<FreMetaInterface>[] = [] // the interfaces that this concept implements

    allPrimProperties(): FreMetaPrimitiveProperty[] {
        const result: FreMetaPrimitiveProperty[] = [...this.implementedPrimProperties()]
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allPrimProperties().forEach((p) => {
                // hide overwritten property
                if (!result.some((previous) => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p)
                }
            })
        }
        return result
    }

    allParts(): FreMetaConceptProperty[] {
        const result: FreMetaConceptProperty[] = this.implementedParts()
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allParts().forEach((p) => {
                // hide overwritten property
                if (!result.some((previous) => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p)
                }
            })
        }
        return result
    }

    allReferences(): FreMetaConceptProperty[] {
        const result: FreMetaConceptProperty[] = [...this.implementedReferences()]
        if (!!this.base && !!this.base.referred) {
            this.base.referred.allReferences().forEach((p) => {
                // hide overwritten property
                if (!result.some((previous) => previous.name === p.name && previous.implementedInBase)) {
                    result.push(p)
                }
            })
        }
        return result
    }

    allProperties(): FreMetaProperty[] {
        let result: FreMetaProperty[] = []
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences())
        return result
    }

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
                // if the prop from the interface is present in the base of this concept (resursive), do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allPrimProperties().some((p) => p.name === intfProp.name)
                }
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

    /**
     * Cache for Implemented Primitive Properties
     */
    $$implementedParts: FreMetaConceptProperty[] | null = null

    implementedParts(): FreMetaConceptProperty[] {
        if (this.$$implementedParts !== null) {
            return [...this.$$implementedParts]
        }
        let result: FreMetaConceptProperty[] = this.parts()
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allParts()) {
                let allreadyIncluded = false
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.parts().some((p) => p.name === intfProp.name)
                // if the prop from the interface is present in the base of this concept, do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allParts().some((p) => p.name === intfProp.name)
                }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some((p) => p.name === intfProp.name)
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp)
                }
            }
        }
        this.$$implementedParts = [...result]
        return result
    }

    /**
     * Cache for Implemented Reference Properties
     */
    $$implementedReferences: FreMetaConceptProperty[] | null = null

    implementedReferences(): FreMetaConceptProperty[] {
        if (this.$$implementedReferences !== null) {
            return this.$$implementedReferences
        }
        let result: FreMetaConceptProperty[] = this.references()
        for (const intf of this.interfaces) {
            for (const intfProp of intf.referred.allReferences()) {
                let allreadyIncluded = false
                // if the prop from the interface is present in this concept, do not include
                allreadyIncluded = this.references().some((p) => p.name === intfProp.name)
                // if the prop from the interface is present in the base of this concept, do not include
                if (!allreadyIncluded && !!this.base && !!this.base.referred) {
                    allreadyIncluded = this.base.referred.allReferences().some((p) => p.name === intfProp.name)
                }
                // if the prop from the interface is present in another implemented interface, do not include
                if (!allreadyIncluded) {
                    allreadyIncluded = result.some((p) => p.name === intfProp.name)
                }
                if (!allreadyIncluded) {
                    result = result.concat(intfProp)
                }
            }
        }
        this.$$implementedReferences = result
        return result
    }

    implementedProperties(): FreMetaProperty[] {
        let result: FreMetaProperty[] = []
        result = result.concat(this.implementedPrimProperties()).concat(this.implementedParts()).concat(this.implementedReferences())
        return result
    }

    allInterfaces(): FreMetaInterface[] {
        let result: FreMetaInterface[] = []
        for (const intf of this.interfaces) {
            const realintf = intf.referred
            if (!!realintf) {
                result.push(realintf)
                result = result.concat(realintf.allBaseInterfaces())
            }
        }
        return result
    }

    /**
     * returns all subconcepts, but not their subconcepts
     */
    allSubConceptsDirect(): FreMetaConcept[] {
        return this.language.concepts.filter((c) => c.base?.referred === this)
    }

    /**
     * returns all subconcepts and subconcepts of the subconcepts
     */
    allSubConceptsRecursive(): FreMetaConcept[] {
        let result = this.allSubConceptsDirect()
        const tmp = this.allSubConceptsDirect()
        tmp.forEach((concept) => (result = result.concat(concept.allSubConceptsRecursive())))
        return result
    }
}
