import { FreMetaDefinitionElement, type ParseLocation } from "../../utils/no-dependencies/index.js"

/**
 *  Used for the initial value of a property
 */
export class FreMetaEnumValue extends FreMetaDefinitionElement {
    sourceName: string
    instanceName: string

    constructor(limitedConceptName: string, limitedInstanceName: string, location: ParseLocation) {
        super()
        this.sourceName = limitedConceptName
        this.instanceName = limitedInstanceName
        this.location = location
    }

    toString(): string {
        return this.sourceName + ":" + this.instanceName
    }
}
