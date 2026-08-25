import { FreMetaLangElement, FreMetaLanguage, FreMetaUnitDescription, FreMetaInterface, FreMetaConcept, FreMetaProperty, PartInitializer, FreMetaConceptProperty, FreMetaPrimitiveProperty, FreMetaPrimitiveType } from "./internal.js"

export abstract class FreMetaClassifier extends FreMetaLangElement {
    private static __ANY: FreMetaClassifier

    static get ANY(): FreMetaClassifier {
        if (FreMetaClassifier.__ANY === null || FreMetaClassifier.__ANY === undefined) {
            FreMetaClassifier.__ANY = new FreMetaConcept()
            FreMetaClassifier.__ANY.name = "ANY"
        }
        return this.__ANY
    }

    id: string = ""
    key: string = ""

    // @ts-ignore
    private _owningLanguage: FreMetaLanguage
    // @ts-ignore
    originalOwningLanguage: FreMetaLanguage
    get language() {
        return this._owningLanguage
    }
    set language(c: FreMetaLanguage) {
        if (this._owningLanguage === undefined || this._owningLanguage === null) {
            this._owningLanguage = c
            // if (this.originalOwningLanguage === undefined || this.originalOwningLanguage === null) {
            this.originalOwningLanguage = c
            // }
        } else {
            // this.originalOwningLanguage = this._owningLanguage;
            this._owningLanguage = c
        }
    }

    isPublic: boolean = false
    properties: FreMetaProperty[] = []
    // TODO remove this attribute and make it a function on 'properties'
    primProperties: FreMetaPrimitiveProperty[] = []
    // get primProperties(): FrePrimitiveProperty[] {
    //     return this.properties.filter(prop => prop instanceof FrePrimitiveProperty) as FrePrimitiveProperty[];
    //     // of
    //     return this.properties.filter(prop => prop.type instanceof FrePrimitiveType) as FrePrimitiveProperty[];
    // }

    parts(): FreMetaConceptProperty[] {
        return this.properties.filter((p) => p instanceof FreMetaConceptProperty && p.isPart) as FreMetaConceptProperty[]
    }

    references(): FreMetaConceptProperty[] {
        return this.properties.filter((p) => p instanceof FreMetaConceptProperty && !p.isPart) as FreMetaConceptProperty[]
    }

    allPrimProperties(): FreMetaPrimitiveProperty[] {
        const result: FreMetaPrimitiveProperty[] = []
        result.push(...this.primProperties)
        return result
    }

    allParts(): FreMetaConceptProperty[] {
        return this.parts()
    }

    allReferences(): FreMetaConceptProperty[] {
        return this.references()
    }

    allProperties(): FreMetaProperty[] {
        const result: FreMetaProperty[] = []
        result.push(...this.allPrimProperties())
        result.push(...this.allParts())
        result.push(...this.allReferences())
        return result
    }

    allSingleNonOptionalPartsInitializers(): PartInitializer[] {
        return this.allParts().flatMap((prop) => {
            if (!prop.isPrimitive && !prop.implementedInBase && prop.isPart && !prop.isList && !prop.isOptional && !prop.hasLimitedType) {
                const subs = FreMetaClassifier.subConceptsIncludingSelf(prop.type)
                if (subs.length === 1 && !subs[0].isAbstract && !(subs[0].name === "FreType")) {
                    return [{ part: prop, concept: subs[0] }]
                } else {
                    return []
                }
            }
            return []
        })
    }

    nameProperty(): FreMetaPrimitiveProperty | undefined {
        return this.allPrimProperties().find((p) => p.name === "name" && p.type === FreMetaPrimitiveType.identifier)
    }

    /**
     * Returns all concepts of which 'self' is a super class, or 'self' is an implemented interface, recursive.
     * Param 'self' IS included in the result.
     * @param self
     */
    public static subConceptsIncludingSelf(self: FreMetaClassifier): FreMetaConcept[] {
        if (self === undefined) {
            return []
        }
        const result = FreMetaClassifier.subConcepts(self)
        if (self instanceof FreMetaConcept) {
            result.push(self)
        }

        return result
    }

    /**
     * Returns all concepts of which 'self' is a super class, or 'self' is an implemented interface, recursive.
     * Param 'self' is NOT included in the result.
     * @param self
     */
    public static subConcepts(self: FreMetaClassifier): FreMetaConcept[] {
        const result: FreMetaConcept[] = []
        if (self.language === undefined) {
            return []
        }
        for (const cls of self.language.concepts) {
            if (FreMetaClassifier.superClassifiers(cls).includes(self)) {
                result.push(cls)
            }
        }
        return result
    }

    /**
     * Returns all concepts that 'self' inherits from, and all interfaces that 'self'
     * implements of inherits from, recursive.
     * @param self
     */
    public static superClassifiers(self: FreMetaClassifier): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = []
        FreMetaClassifier.superClassifiersRecursive(self, result)
        return result
    }

    private static superClassifiersRecursive(self: FreMetaClassifier, result: FreMetaClassifier[]) {
        if (self instanceof FreMetaConcept) {
            if (!!self.base) {
                result.push(self.base.referred)
                FreMetaClassifier.superClassifiersRecursive(self.base.referred, result)
            }
            for (const i of self.interfaces) {
                result.push(i.referred)
                FreMetaClassifier.superClassifiersRecursive(i.referred, result)
            }
        }
        if (self instanceof FreMetaUnitDescription) {
            for (const i of self.interfaces) {
                result.push(i.referred)
                FreMetaClassifier.superClassifiersRecursive(i.referred, result)
            }
        }
        if (self instanceof FreMetaInterface) {
            for (const i of self.base) {
                result.push(i.referred)
                FreMetaClassifier.superClassifiersRecursive(i.referred, result)
            }
        }
    }
}
