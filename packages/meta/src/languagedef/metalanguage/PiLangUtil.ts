import { PiClassifier, PiConcept, PiInterface, PiPrimitiveProperty } from "./index";

// TODO add all find methods from PiLanguage.ts to this util module

export class PiLangUtil {
    /**
     * Returns the set of all concepts that are the base of 'self' recursively.
     * @param self
     */
    public static superConcepts(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        PiLangUtil.superConceptsRecursive(self, result);
        return result;
    }

    private static superConceptsRecursive(self: PiClassifier, result: PiConcept[]): void {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                result.push(self.base.referred);
                PiLangUtil.superConceptsRecursive(self.base.referred, result);
            }
            // TODO jos, why did you put this here? It seems to work without it.
            // for (let i of self.interfaces) {
            //     PiLangUtil.superConceptsRecursive(i.referred, result);
            // }
        }
        // if (self instanceof PiInterface) {
        //     for (let i of self.base) {
        //         PiLangUtil.superConceptsRecursive(i.referred, result);
        //     }
        // }
    }

    /**
     * Returns all interfaces that 'self' implements, if 'self' is a concept, recursive.
     * Returns all interfaces that 'self' inherits from, recursive
     * @param self
     */
    public static superInterfaces(self: PiClassifier): PiInterface[] {
        const result: PiInterface[] = [];
        PiLangUtil.superInterfacesRecursive(self, result);
        return result;
    }

    private static superInterfacesRecursive(self: PiClassifier, result: PiInterface[]): void {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                PiLangUtil.superInterfacesRecursive(self.base.referred, result);
            }
            for (let i of self.interfaces) {
                result.push(i.referred);
                PiLangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                result.push(i.referred);
                PiLangUtil.superInterfacesRecursive(i.referred, result);
            }
        }
    }

    /**
     * Returns all concepts that 'self' inherits from, and all interfaces that 'self'
     * implements of inherits from, recursive.
     * @param self
     */
    public static superClassifiers(self: PiClassifier): PiClassifier[] {
        const result: PiClassifier[] = [];
        PiLangUtil.superClassifiersRecursive(self, result);
        return result;
    }

    private static superClassifiersRecursive(self: PiClassifier, result: PiClassifier[]) {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                result.push(self.base.referred);
                PiLangUtil.superClassifiersRecursive(self.base.referred, result);
            }
            for (let i of self.interfaces) {
                result.push(i.referred);
                PiLangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                result.push(i.referred);
                PiLangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
    }

    public static subConcepts(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        for (let cls of self.language.concepts) {
            if (PiLangUtil.superClassifiers(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    public static subConceptsIncludingSelf(self: PiClassifier): PiConcept[] {
        const result= PiLangUtil.subConcepts(self);
        if(self instanceof PiConcept) {
            result.push(self);
        }
        return result;
    }

    public static findNameProp(con: PiConcept): PiPrimitiveProperty {
        return con.allPrimProperties().find(p => p.name === "name" && p.primType === "string");
    }
}
