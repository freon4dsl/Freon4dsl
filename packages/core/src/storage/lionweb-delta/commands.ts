import type {
    SignOnRequest,
    AddPropertyCommand,
    AddPartitionCommand,
    ChangePropertyCommand,
    DeletePropertyCommand,
    SubscribeToPartitionContentsRequest,
    UnsubscribeFromPartitionContentsRequest,
    AddChildCommand,
    DeleteChildCommand,
    AddReferenceCommand,
    DeleteReferenceCommand,
    LionWebJsonMetaPointer,
    LionWebId,
    LionWebJsonProperty,
} from "@lionweb/server-delta-shared"

let queryId = 1
// let commandId = 1

export const newSignOnRequest = (repo: string, clientId: string): SignOnRequest => {
    return {
        messageKind: "SignOnRequest",
        repositoryId: repo,
        deltaProtocolVersion: "2023.1",
        clientId: clientId,
        queryId: `query-id-${queryId++}`,
        additionalInfos: [],
    }
}

export const newSubscribeToPartitionRequest = (partition: string): SubscribeToPartitionContentsRequest => {
    return {
        messageKind: "SubscribeToPartitionContentsRequest",
        partition: partition,
        queryId: `query-id-${queryId++}`,
        additionalInfos: [],
    }
}

export const newUnSubscribeToPartitionRequest = (partition: string): UnsubscribeFromPartitionContentsRequest => {
    return {
        messageKind: "UnsubscribeFromPartitionContentsRequest",
        partition: partition,
        queryId: `query-id-${queryId++}`,
        additionalInfos: [],
    }
}

export const newAddPropertyCommand = (nodeid: string, newValue: string, propertyKey: string): AddPropertyCommand => {
    return {
        messageKind: "AddProperty",
        commandId: `command-id-${queryId++}`,
        node: nodeid,
        newValue: newValue,
        property: {
            language: "LionCore-builtins",
            key: propertyKey,
            version: "2023.1",
        },
        additionalInfos: [],
    }
}

export const newChangePropertyCommand = (nodeid: string, newValue: string, propertyKey: string, propertyLanguage: string): ChangePropertyCommand => {
    return {
        messageKind: "ChangeProperty",
        commandId: `command-id-${queryId++}`,
        node: nodeid,
        newValue: newValue,
        property: {
            language: propertyLanguage,
            key: propertyKey,
            version: "2023.1",
        },
        additionalInfos: [],
    }
}

export const newDeletePropertyCommand = (nodeid: string, propertyKey: string): DeletePropertyCommand => {
    return {
        messageKind: "DeleteProperty",
        commandId: `command-id-${queryId++}`,
        node: nodeid,
        property: {
            language: "LionCore-builtins",
            key: propertyKey,
            version: "2023.1",
        },
        additionalInfos: [],
    }
}

export type PartitionType = {
    id: LionWebId
    classifier: LionWebJsonMetaPointer
    properties?: LionWebJsonProperty[]
}
export const newAddPartitionCommand = (partition: PartitionType): AddPartitionCommand => {
    return {
        messageKind: "AddPartition",
        commandId: `command-id-${queryId++}`,
        newPartition: {
            nodes: [
                {
                    id: partition.id,
                    parent: null,
                    properties: partition.properties ?? [],
                    containments: [],
                    references: [],
                    classifier: partition.classifier,
                    annotations: [],
                },
            ],
        },
        additionalInfos: [],
    }
}

type NewChild = {
    id: LionWebId
    cls: LionWebJsonMetaPointer
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    props: PropValue[]
}
export type PropValue = { prop: LionWebJsonMetaPointer; value: string }

export const newAddChild = (child: NewChild): AddChildCommand => {
    return {
        messageKind: "AddChild",
        commandId: `command-id-${queryId++}`,
        containment: child.containment,
        index: 0,
        parent: child.parent,
        newChild: {
            nodes: [
                {
                    id: child.id,
                    parent: child.parent,
                    properties: child.props.map((p) => {
                        return { property: p.prop, value: p.value }
                    }),
                    containments: [],
                    references: [],
                    classifier: child.cls,
                    annotations: [],
                },
            ],
        },
        additionalInfos: [],
    }
}

export const newAddChildCommand = (
    nodeid: string,
    clsKey: LionWebJsonMetaPointer,
    parent: string,
    containmentKey: string,
    props: PropValue[] = [],
): AddChildCommand => {
    return {
        messageKind: "AddChild",
        commandId: `command-id-${queryId++}`,
        containment: {
            language: "LogoProgram",
            key: containmentKey,
            version: "1",
        },
        index: 0,
        parent: parent,
        newChild: {
            nodes: [
                {
                    id: nodeid,
                    parent: parent,
                    properties: props.map((p) => {
                        return { property: p.prop, value: p.value }
                    }),
                    containments: [],
                    references: [],
                    classifier: clsKey,
                    annotations: [],
                },
            ],
        },
        additionalInfos: [],
    }
}

export type DeleteChildType = {
    id: LionWebId
    index: number
    parent: LionWebId
    containment: LionWebJsonMetaPointer
}

export const deleteChild = (deleteChild: DeleteChildType): DeleteChildCommand => {
    return {
        messageKind: "DeleteChild",
        commandId: `command-id-${queryId++}`,
        containment: deleteChild.containment,
        index: deleteChild.index,
        parent: deleteChild.parent,
        deletedChild: deleteChild.id,
        additionalInfos: [],
    }
}

export type AddReferenceType = {
    id: LionWebId
    index: number
    target: LionWebId
    resolveInfo: string
    reference: LionWebJsonMetaPointer
}

export const addReference = (addRef: AddReferenceType): AddReferenceCommand => {
    return {
        messageKind: "AddReference",
        commandId: `command-id-${queryId++}`,
        parent: addRef.id,
        reference: addRef.reference,
        index: addRef.index,
        newTarget: addRef.target,
        newResolveInfo: addRef.resolveInfo,
        additionalInfos: [],
    }
}

export const deleteReference = (ref: AddReferenceType): DeleteReferenceCommand => {
    return {
        messageKind: "DeleteReference",
        commandId: `command-id-${queryId++}`,
        parent: ref.id,
        reference: ref.reference,
        deletedTarget: ref.target,
        deletedResolveInfo: ref.resolveInfo,
        index: ref.index,
        additionalInfos: [],
    }
}

export const ALL = {}
