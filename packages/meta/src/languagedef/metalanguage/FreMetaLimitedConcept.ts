import { FreMetaConcept, FreMetaInstance } from "./internal.js"

export class FreMetaLimitedConcept extends FreMetaConcept {
    instances: FreMetaInstance[] = []

    findInstance(name: string): FreMetaInstance | undefined {
        return this.instances.find((inst) => inst.name === name)
    }

    allInstances(): FreMetaInstance[] {
        const result: FreMetaInstance[] = []
        result.push(...this.instances)
        if (!!this.base && this.base.referred instanceof FreMetaLimitedConcept) {
            result.push(...this.base.referred.allInstances())
        }
        return result
    }

    toString(): string {
        return this.name
    }
}
