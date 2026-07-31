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
import { type FreNamedNode, FreNodeReference } from "../../ast/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLionWebSerializer } from "../../storage/index.js"
import { isNullOrUndefined, notNullOrUndefined } from "../../util/index.js"
import { type FreDelta, FrePartDelta, FrePartListDelta, FrePrimDelta, FreTransactionDelta } from "../../change-manager/FreDelta.js"
import { LanguageVersion } from "../utils/index.js"

const LOGGER = new FreLogger("LionWebDelta")

class FreToLionWebDeltaConverter {
    private _lionwebSerializer

    get lionwebSerializer(): FreLionWebSerializer {
        if (this._lionwebSerializer === undefined) {
            this._lionwebSerializer = new FreLionWebSerializer()
        }
        return this._lionwebSerializer
    }
    set lionwebSerializer(value: FreLionWebSerializer) {
        this._lionwebSerializer = value
    }

    convertDeltaToLionWeb(delta: FreDelta): DeltaCommand {
        LOGGER.log(`sendDelta: ${delta.toString()}`)
        let lionwebCommand: DeltaCommand
        if (delta instanceof FreTransactionDelta) {
            lionwebCommand = this.convertTransactionDelta(delta)
            // throw new Error("convertDeltaToLionWeb: did not expect a transactional FreDelta")
        } else if (delta instanceof FrePrimDelta) {
            lionwebCommand = this.convertPrimDelta(delta)
        } else if (delta instanceof FrePartDelta) {
            lionwebCommand = this.convertPartDelta(delta)
        } else if (delta instanceof FrePartListDelta) {
            lionwebCommand = this.convertPartListDelta(delta)
        }
        return lionwebCommand
    }

    private convertTransactionDelta(delta: FreTransactionDelta) {
        const tranactionDelta: CompositeCommand = {
            messageKind: "CompositeCommand",
            commandId: "cc",
            parts: [],
            additionalInfos: [],
        }
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
        if (propertyDef.propertyKind === "reference") {
            return this.convertReferenceListDelta(delta)
        }
        const result: DeltaCommand[] = []
        if (delta.removed.length > 0) {
            for (const removedNode of delta.removed) {
                if (delta.owner.freIsModel()) {
                    const lionwebCommand = {
                        messageKind: "DeletePartition",
                        commandId: "comm-id",
                        deletedPartition: removedNode.freId(),
                        additionalInfos: [],
                    } as DeletePartitionCommand
                    result.push(lionwebCommand)
                } else {
                    const lionwebCommand = {
                        messageKind: "DeleteChild",
                        parent: delta.owner.freId(),
                        commandId: "comm-id",
                        containment: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: LanguageVersion,
                        },
                        deletedChild: removedNode.freId(),
                        index: delta.index,
                        additionalInfos: [],
                    } as DeleteChildCommand
                    result.push(lionwebCommand)
                }
            }
        }
        if (delta.added.length > 0) {
            for (const addedNode of delta.added) {
                if (delta.owner.freIsModel()) {
                    const lionwebCommand = {
                        messageKind: "AddPartition",
                        commandId: "comm-id",
                        newPartition: { nodes: FreLionWebSerializer.getInstance().serializeFreNode(addedNode) },
                        additionalInfos: [],
                    } as AddPartitionCommand
                    result.push(lionwebCommand)
                } else {
                    const lionwebCommand = {
                        messageKind: "AddChild",
                        parent: delta.owner.freId(),
                        commandId: "comm-id",
                        containment: {
                            key: propertyDef.key,
                            language: propertyDef.language,
                            version: LanguageVersion,
                        },
                        newChild: { nodes: FreLionWebSerializer.getInstance().serializeFreNode(addedNode) },
                        index: delta.index,
                        additionalInfos: [],
                    } as AddChildCommand
                    result.push(lionwebCommand)
                }
            }
        }
        if (result.length === 1) {
            return result[0]
        } else {
            return {
                messageKind: "CompositeCommand",
                commandId: "dummy",
                parts: result,
                additionalInfos: [],
            } as CompositeCommand
        }
    }

    private convertReferenceListDelta(delta: FrePartListDelta): DeltaCommand {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        const result: DeltaCommand[] = []
        if (delta.removed.length > 0) {
            for (const removedNode of delta.removed) {
                const lionwebCommand = {
                    messageKind: "DeleteReference",
                    parent: delta.owner.freId(),
                    commandId: "comm-id",
                    reference: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    deletedTarget: (removedNode as unknown as FreNodeReference<FreNamedNode>).lionWeb?.reference ?? null,
                    deletedResolveInfo: (removedNode as unknown as FreNodeReference<FreNamedNode>).lionWeb?.resolveInfo ?? null,
                    index: delta.index,
                    additionalInfos: [],
                } as DeleteReferenceCommand
                result.push(lionwebCommand)
            }
        }

        if (delta.added.length > 0) {
            for (const addedNode of delta.added) {
                const lionwebCommand = {
                    messageKind: "AddReference",
                    parent: delta.owner.freId(),
                    commandId: "comm-id",
                    reference: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    newTarget: (addedNode as unknown as FreNodeReference<FreNamedNode>).referred?.freId() ?? null,
                    newResolveInfo: (addedNode as unknown as FreNodeReference<FreNamedNode>).name,
                    index: delta.index,
                    additionalInfos: [],
                } as AddReferenceCommand
                result.push(lionwebCommand)
                // add the lionweb resolveInfo and referred to the in memory reference
                const addedRef = addedNode as unknown as FreNodeReference<FreNamedNode>
                addedRef.lionWeb = {
                    resolveInfo: addedRef.name ?? null,
                    reference: addedRef.referred?.freId() ?? null,
                }
                console.log(`REFERENCE set to [${addedRef.lionWeb.resolveInfo}, ${addedRef.lionWeb.reference}]`)
            }
        }
        if (result.length === 1) {
            return result[0]
        } else {
            // TODO Delta
            throw new Error("TODO: Cannot handle multiple changes in Reference PartListDelta yet")
            // return tranactionDelta
        }
    }
    private convertReferenceDelta(delta: FrePartDelta): DeltaCommand {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        const propertyConcept = FreLanguage.getInstance().concept(propertyDef.type)
        if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
            return this.convertLimitedDelta(delta)
        }
        const oldRef = delta.oldValue
        const newRef = delta.newValue
        LOGGER.log(`convertReferenceDelta ${delta.toString()}`)
        if ((isNullOrUndefined(newRef) || newRef instanceof FreNodeReference) && (isNullOrUndefined(oldRef) || oldRef instanceof FreNodeReference)) {
            if (isNullOrUndefined(oldRef) && notNullOrUndefined(newRef)) {
                // add the lionweb resolveInfo and referred to the in memory reference
                const addedRef = newRef as unknown as FreNodeReference<FreNamedNode>
                addedRef.lionWeb = {
                    resolveInfo: addedRef.name ?? null,
                    reference: addedRef.referred?.freId() ?? null,
                }
                console.log(`REFERENCE ADD set to [${addedRef.lionWeb.resolveInfo}, ${addedRef.lionWeb.reference}]`)
                return {
                    messageKind: "AddReference",
                    commandId: "",
                    parent: delta.owner.freId(),
                    reference: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    newResolveInfo: newRef.referred.name,
                    newTarget: newRef.referred?.freId() ?? null,
                    index: delta.index ?? 0,
                    additionalInfos: [],
                } as AddReferenceCommand
            } else if (notNullOrUndefined(oldRef) && notNullOrUndefined(newRef)) {
                // add the lionweb resolveInfo and referred to the in memory reference
                newRef.lionWeb = {
                    resolveInfo: newRef.name ?? null,
                    reference: newRef.referred?.freId() ?? null,
                }
                console.log(`REFERENCE CHANGE set to [${newRef.lionWeb.resolveInfo}, ${newRef.lionWeb.reference}]`)
                return {
                    messageKind: "ChangeReference",
                    commandId: "",
                    parent: delta.owner.freId(),
                    reference: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    newResolveInfo: newRef.name,
                    newTarget: newRef.referred?.freId() ?? null,
                    oldResolveInfo: oldRef.lionWeb?.resolveInfo ?? null,
                    oldTarget: oldRef.lionWeb?.reference ?? null,
                    index: delta.index ?? 0,
                    additionalInfos: [],
                } as ChangeReferenceCommand
            } else if (notNullOrUndefined(oldRef) && isNullOrUndefined(newRef)) {
                return {
                    messageKind: "DeleteReference",
                    commandId: "",
                    parent: delta.owner.freId(),
                    reference: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    deletedResolveInfo: oldRef.lionWeb?.resolveInfo ?? null,
                    deletedTarget: oldRef.lionWeb?.reference ?? null,
                    index: delta.index ?? 0,
                    additionalInfos: [],
                } as DeleteReferenceCommand
            }
        }
        // Error, the parts should be node references
        throw new Error(`convertReferenceDelta error: the parts (${oldRef?.constructor?.name} and ${newRef?.constructor?.name})`)
    }

    private convertPartDelta(delta: FrePartDelta): DeltaCommand {
        LOGGER.log(`convertPartDelta ${delta.toString()}`)
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        if (propertyDef.propertyKind === "reference") {
            return this.convertReferenceDelta(delta)
        }
        if (isNullOrUndefined(delta.oldValue)) {
            if (delta.owner.freIsModel()) {
                return {
                    messageKind: "AddPartition",
                    commandId: "command",
                    newPartition: { nodes: this.lionwebSerializer.serializeFreNode(delta.newValue) },
                    additionalInfos: [],
                } as AddPartitionCommand
            } else {
                return {
                    messageKind: "AddChild",
                    commandId: "id",
                    containment: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    index: 0,
                    newChild: { nodes: this.lionwebSerializer.serializeFreNode(delta.newValue) },
                    parent: delta.owner.freId(),
                    additionalInfos: [],
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
                    version: LanguageVersion,
                },
                index: delta.index,
                replacedChild: null,
                newChild: { nodes: this.lionwebSerializer.serializeFreNode(delta.newValue) },
                parent: delta.owner.freId(),
                additionalInfos: [],
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
                    version: LanguageVersion,
                },
                index: delta.index ?? 0,
                deletedChild: delta.oldValue.freId(),
                additionalInfos: [],
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
                    version: LanguageVersion,
                },
                additionalInfos: [],
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
                    version: LanguageVersion,
                },
                additionalInfos: [],
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
                    version: LanguageVersion,
                },
                additionalInfos: [],
            } as DeletePropertyCommand
        }
    }

    convertLimitedDelta(delta: FrePartDelta): DeltaCommand {
        const propertyDef = FreLanguage.getInstance().classifierProperty(delta.owner.freLanguageConcept(), delta.propertyName)
        // const propertyConcept = FreLanguage.getInstance().concept(propertyDef.type)

        if (propertyDef.isList) {
            console.error("CANNOT CONVERT LIMITED LIST")
            throw new Error("CANNOT CONVERT LIMITED LIST")
        } else {
            const limitedOldName = (delta.oldValue as any as FreNodeReference<never>)?.name
            const limitedNewName = (delta.newValue as any as FreNodeReference<never>)?.name
            console.log(`LIMITED value '${delta.oldValue}' => '${delta.newValue}'`)
            console.log(`LIMITED  name '${limitedOldName}' => '${limitedNewName}'`)
            if (delta.oldValue === undefined && notNullOrUndefined(delta.newValue)) {
                return {
                    messageKind: "AddProperty",
                    commandId: "dummy",
                    node: delta.owner.freId(),
                    property: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    newValue: limitedNewName,
                    additionalInfos: [],
                } as AddPropertyCommand
            } else if (delta.oldValue !== undefined && notNullOrUndefined(delta.newValue)) {
                return {
                    messageKind: "ChangeProperty",
                    commandId: "dummy",
                    node: delta.owner.freId(),
                    property: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    newValue: limitedNewName,
                    additionalInfos: [],
                } as ChangePropertyCommand
            } else {
                return {
                    messageKind: "DeleteProperty",
                    commandId: "dummy",
                    node: delta.owner.freId(),
                    property: {
                        key: propertyDef.key,
                        language: propertyDef.language,
                        version: LanguageVersion,
                    },
                    additionalInfos: [],
                } as DeletePropertyCommand
            }
        }
    }
}

function valueToString(o: string | boolean | number): string {
    switch (typeof o) {
        case "string":
            return o
        case "boolean":
            return o.toString()
        case "number":
            return "" + o
        default:
            return "null"
    }
}

export const LIONWEB_DELTA = new FreToLionWebDeltaConverter()
