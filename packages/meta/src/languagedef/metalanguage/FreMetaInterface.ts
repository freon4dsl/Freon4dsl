import { FreMetaClassifier, MetaElementReference, FreMetaProperty, FreMetaConceptProperty, FreMetaPrimitiveProperty } from "./internal.js"

export class FreMetaInterface extends FreMetaClassifier {
    base: MetaElementReference<FreMetaInterface>[] = []

    allPrimProperties(): FreMetaPrimitiveProperty[] {
        let result: FreMetaPrimitiveProperty[] = [] // return a new array
        result.push(...this.primProperties)
        for (const intf of this.base) {
            result = result.concat(intf.referred.allPrimProperties())
        }
        return result
    }

    allParts(): FreMetaConceptProperty[] {
        let result: FreMetaConceptProperty[] = this.parts()
        for (const intf of this.base) {
            result = result.concat(intf.referred.allParts())
        }
        return result
    }

    allReferences(): FreMetaConceptProperty[] {
        let result: FreMetaConceptProperty[] = this.references()
        for (const intf of this.base) {
            result = result.concat(intf.referred.allReferences())
        }
        return result
    }

    allProperties(): FreMetaProperty[] {
        let result: FreMetaProperty[] = []
        result = result.concat(this.allPrimProperties()).concat(this.allParts()).concat(this.allReferences())
        return result
    }

    allBaseInterfaces(): FreMetaInterface[] {
        let result: FreMetaInterface[] = []
        for (const base of this.base) {
            const realbase = base.referred
            if (!!realbase) {
                result.push(realbase)
                result = result.concat(realbase.allBaseInterfaces())
            }
        }
        return result
    }

    /**
     * returns all subinterfaces, but not their subinterfaces
     */
    allSubInterfacesDirect(): FreMetaInterface[] {
        return this.language.interfaces.filter((c) => c.base?.find((b) => b.referred === this) !== undefined)
    }

    /**
     * returns all subinterfaces and subinterfaces of the subinterfaces
     */
    allSubInterfacesRecursive(): FreMetaInterface[] {
        let result = this.allSubInterfacesDirect()
        const tmp = this.allSubInterfacesDirect()
        tmp.forEach((concept) => (result = result.concat(concept.allSubInterfacesRecursive())))
        return result
    }
}
