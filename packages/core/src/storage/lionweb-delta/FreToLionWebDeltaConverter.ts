import type {
    AddChildCommand,
    AddPartitionCommand,
    AddPropertyCommand,
    AddReferenceCommand,
    ChangePropertyCommand,
    ChangeReferenceCommand,
    CompositeCommand,
    DeleteChildCommand,
    DeletePartitionCommand,
    DeletePropertyCommand,
    DeleteReferenceCommand,
    DeltaCommand,
    ReplaceChildCommand,
} from "@lionweb/server-delta-shared"
import { FreNodeReference } from "../../ast/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLionwebSerializer } from "../../storage/index.js"
import { isNullOrUndefined, notNullOrUndefined } from "../../util/index.js"
import  { type FreDelta, FrePartDelta, FrePartListDelta, FrePrimDelta, FreTransactionDelta } from "../../change-manager/FreDelta.js"

const LOGGER = new FreLogger("LionWebDelta").show()

class FreToLionWebDeltaConverter {
    private _lionwebSerializer

    get lionwebSerializer(): FreLionwebSerializer {
        if (this._lionwebSerializer === undefined) {
            this._lionwebSerializer = new FreLionwebSerializer()
        }
        return this._lionwebSerializer
    }
    set lionwebSerializer(value: FreLionwebSerializer) {
        this._lionwebSerializer = value
    }

    convertDeltaToLionWeb(delta: FreDelta): DeltaCommand {
        LOGGER.log(`sendDelta: ${delta.toString()}`)
        let lionwebCommand: DeltaCommand
        if (delta instanceof FreTransactionDelta) {
            lionwebCommand = this.convertTransactionDelta(delta)
        } else if (delta instanceof FrePrimDelta) {
            lionwebCommand = this.convertPrimDelta(delta)
        } else if (delta instanceof FrePartDelta) {
            lionwebCommand = this.convertPartDelta(delta)
        } else if (delta instanceof FrePartListDelta) {
            lionwebCommand = this.convertPartListDelta(delta)
        }
        // console.log(`Getting ${JSON.stringify(delta)}`)
        // console.log(`Command to send is ${JSON.stringify(lionwebCommand)}`)
        return lionwebCommand
    }

    private convertTransactionDelta(delta: FreTransactionDelta) {
        const tranactionDelta = {
            additionalInfo: [],
            commandId: "cc",
            messageKind: "CompositeCommand",
            parts: [],
        } as CompositeCommand
        for (const del of delta.internalDeltas) {
            const lionwebCommand = this.convertDeltaToLionWeb(del)
            tranactionDelta.parts.push(lionwebCommand)
        }
        if (tranactionDelta.parts.length === 1) {
            return tranactionDelta.parts[0]
        } else {
            return tranactionDelta
        }
    }

    private convertPartListDelta(delta: FrePartListDelta): DeltaCommand {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        const tranactionDelta = {
            additionalInfo: [],
            commandId: "cc",
            messageKind: "CompositeCommand",
            parts: [],
        } as CompositeCommand
        if (delta.removed.length > 0) {
            for (const removedNode of delta.removed) {
                if (delta.owner.freIsModel()) {
                    const lionwebCommand = {
                        messageKind: "DeletePartition",
                        commandId: "comm-id",
                        deletedPartition: removedNode.freId(),
                        additionalInfo: [],
                    } as DeletePartitionCommand
                    tranactionDelta.parts.push(lionwebCommand)
                } else {
                    const lionwebCommand = {
                        messageKind: "DeleteChild",
                        parent: delta.owner.freId(),
                        commandId: "comm-id",
                        containment: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: "2023.1",
                        },
                        deletedChild: removedNode.freId(),
                        index: delta.index,
                        additionalInfo: [],
                    } as DeleteChildCommand
                    tranactionDelta.parts.push(lionwebCommand)
                }
            }
        }
        if (delta.added.length > 0) {
            for (const addedNode of delta.added) {
                if (delta.owner.freIsModel()) {
                    const lionwebCommand = {
                        messageKind: "AddPartition",
                        commandId: "comm-id",
                        newPartition: { nodes: this.lionwebSerializer.convertToJSON(addedNode) },
                        additionalInfo: []
                    } as AddPartitionCommand
                    tranactionDelta.parts.push(lionwebCommand)
                } else {
                    const lionwebCommand = {
                        messageKind: "AddChild",
                        parent: delta.owner.freId(),
                        commandId: "comm-id",
                        containment: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: "2023.1",
                        },
                        newChild: { nodes: this.lionwebSerializer.convertToJSON(addedNode) },
                        index: delta.index,
                        additionalInfo: [],
                    } as AddChildCommand
                    tranactionDelta.parts.push(lionwebCommand)
                }
            }
        }
        if (tranactionDelta.parts.length === 1) {
            return tranactionDelta.parts[0]
        } else {
            return tranactionDelta
        }
    }

    private convertReferenceDelta(delta: FrePartDelta): DeltaCommand {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        const oldRef = delta.oldValue
        const newRef = delta.newValue
        console.log(`convertReferenceDelta ${delta.toString()}`)
        if (newRef instanceof FreNodeReference && oldRef instanceof FreNodeReference) {
            if (newRef.name === oldRef.name && newRef.referred !== oldRef.referred) {
            } else if (newRef.name !== oldRef.name && newRef.referred === oldRef.referred) {
                if (newRef.name === undefined) {
                } else {
                }                
            } else if (newRef.name !== oldRef.name && newRef.referred !== oldRef.referred) {
                if (newRef.name === undefined && newRef.referred === undefined) {
                    return {
                        messageKind: "DeleteReference",
                        commandId: "",
                        parent: delta.owner.freId(),
                        reference: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: "2023.1",
                        },
                        deletedResolveInfo: oldRef.name,
                        deletedTarget: oldRef.referred.freId(),
                        index: delta.index ?? 0,
                        additionalInfo: [],
                    } as DeleteReferenceCommand
                } else if (oldRef.name === undefined && oldRef.referred === undefined) {
                    return {
                        messageKind: "AddReference",
                        commandId: "",
                        parent: delta.owner.freId(),
                        reference: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: "2023.1",
                        },
                        newResolveInfo: newRef.referred.name,
                        newTarget: newRef.referred.freId(),
                        index: delta.index ?? 0,
                        additionalInfo: [],
                    } as AddReferenceCommand
                } else {
                    // Both are defined, but value differs
                    return {
                        messageKind: "ChangeReference",
                        commandId: "",
                        parent: delta.owner.freId(),
                        reference: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: "2023.1",
                        },
                        newResolveInfo: newRef.name,
                        newTarget: newRef.referred?.freId(),
                        oldResolveInfo: oldRef.name,
                        oldTarget: oldRef.referred?.freId() ?? "",
                        index: delta.index ?? 0,
                        additionalInfo: [],
                    } as ChangeReferenceCommand
                }
            }
        } else if (oldRef instanceof FreNodeReference && newRef === undefined) {
            return {
                messageKind: "DeleteReference",
                commandId: "",
                parent: delta.owner.freId(),
                reference: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                deletedResolveInfo: oldRef.name,
                deletedTarget: oldRef.referred.freId(),
                index: delta.index ?? 0,
                additionalInfo: [],
            } as DeleteReferenceCommand
        } else if (oldRef === undefined && newRef instanceof FreNodeReference) {
            return {
                messageKind: "AddReference",
                commandId: "",
                parent: delta.owner.freId(),
                reference: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                newResolveInfo: newRef.referred?.name,
                newTarget: newRef.referred?.freId(),
                index: delta.index ?? 0,
                additionalInfo: [],
            } as AddReferenceCommand

        }
        // Error, the parts should be node references
        throw new Error("Error, the parts should be node references")
    }

    private convertPartDelta(delta: FrePartDelta): DeltaCommand {
        console.log(`convertPartDelta ${delta.toString()}`)
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        if (propertyDef.propertyKind === "reference") {
            return this.convertReferenceDelta(delta)
        }
        if (isNullOrUndefined(delta.oldValue)) {
            if (delta.owner.freIsModel()) {
                return {
                    messageKind: "AddPartition",
                    commandId: "command",
                    newPartition: { nodes: this.lionwebSerializer.convertToJSON(delta.newValue) },
                    additionalInfo: []
                } as AddPartitionCommand
            } else {
                return {
                    messageKind: "AddChild",
                    commandId: "id",
                    containment: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: "2023.1",
                    },
                    index: 0,
                    newChild: { nodes: this.lionwebSerializer.convertToJSON(delta.newValue) },
                    parent: delta.owner.freId(),
                    additionalInfo: [],
                } as AddChildCommand
            }
        } else if (notNullOrUndefined(delta.newValue)) {
            // && notNullOrUndefined(delta.oldValue)
            return {
                messageKind: "ReplaceChild",
                commandId: "id",
                containment: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                index: delta.index,
                replacedChild: null,
                newChild: { nodes: this.lionwebSerializer.convertToJSON(delta.newValue) },
                parent: delta.owner.freId(),
                additionalInfo: [],
            } as ReplaceChildCommand
        } else {
            //  { isNullOrUndefined(delta.newValue)) && notNullOrUndefined(delta.oldValue)
            // new value is undefined, old valie isn't
            return {
                messageKind: "DeleteChild",
                parent: delta.owner.freId(),
                commandId: "id",
                containment: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                index: delta.index ?? 0,
                deletedChild: delta.oldValue.freId(),
                additionalInfo: [],
            } as DeleteChildCommand
        }
    }

    private convertPrimDelta(delta: FrePrimDelta) {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        if (notNullOrUndefined(delta.oldValue)) {
            return {
                commandId: "command-id",
                messageKind: "ChangeProperty",
                newValue: valueToString(delta.newValue),
                node: delta.owner.freId(),
                property: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                additionalInfo: [],
            } as ChangePropertyCommand
        } else if (notNullOrUndefined(delta.newValue)) {
            return {
                commandId: "command-id",
                messageKind: "AddProperty",
                newValue: valueToString(delta.newValue),
                node: delta.owner.freId(),
                property: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                additionalInfo: [],
            } as AddPropertyCommand
        } else {
            // new value is empty
            return {
                commandId: "command=-id",
                messageKind: "DeleteProperty",
                node: delta.owner.freId(),
                property: {
                    key: propertyDef.key,
                    language: propertyDef.language,
                    version: "2023.1",
                },
                additionalInfo: [],
            } as DeletePropertyCommand
        }
    }
}

function valueToString(o: string | boolean | number): string {
    switch (typeof o) {
        case "string": return o;
        case "boolean": return o.toString();
        case "number": return "" + o
        default: return "null"
    }
}

export const LIONWEB_DELTA = new FreToLionWebDeltaConverter()
