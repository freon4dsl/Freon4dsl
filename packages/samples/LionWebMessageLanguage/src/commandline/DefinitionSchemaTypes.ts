export type MessageGroup = {
    name: string;
    taggedUnionProperty: string; // messageKind 
    sharedProperties: PropertyType1[];
    messages: ObjectType[];
}

export type PropertyType1 = {
    name: string;
    type: string;
    isList: boolean,
    isOptional: boolean,
    mayBeNull: boolean
}

export type ObjectType = {
    name: string;
    properties: PropertyType1[];
}

export type Types = {
    name: string;
    primitiveTypes: PrimitiveType1[];
    objectTypes:  ObjectType[];

}
export type PrimitiveType1 = {
    name: string
    primitiveType: string;
    validator?: string;
}

export const tt: Types =
    {
        "name": "DeltaTypes",
        "primitiveTypes": [
            {
                "name": "String",
                "primitiveType": "string"
            },
            {
                "name": "SequenceNumber",
                "primitiveType": "number"
            },
            {
                "name": "CommandId",
                "primitiveType": "string"
            },
            {
                "name": "ParticipationId",
                "primitiveType": "string"
            },
            {
                "name": "Number",
                "primitiveType": "number"
            },
            {
                "name": "QueryId",
                "primitiveType": "string"
            },
            {
                "name": "Boolean",
                "primitiveType": "boolean"
            }
        ],
        "objectTypes": [
            {
                "name": "ProtocolMessage",
                "properties": [
                    {
                        "name": "kind",
                        "type": "String",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    },
                    {
                        "name": "message",
                        "type": "String",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    },
                    {
                        "name": "data",
                        "type": "KeyValuePair",
                        "isList": true,
                        "isOptional": false,
                        "mayBeNull": false
                    }
                ]
            },
            {
                "name": "KeyValuePair",
                "properties": [
                    {
                        "name": "key",
                        "type": "String",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    },
                    {
                        "name": "value",
                        "type": "String",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    }
                ]
            },
            {
                "name": "CommandSource",
                "properties": [
                    {
                        "name": "participationId",
                        "type": "ParticipationId",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    },
                    {
                        "name": "commandId",
                        "type": "CommandId",
                        "isList": false,
                        "isOptional": false,
                        "mayBeNull": false
                    }
                ]
            },
            {
                "name": "LionWebDeltaJsonChunk",
                "properties": []
            }
        ]
    }

export const A: MessageGroup =
{
    "name": "Command",
    "taggedUnionProperty": "messageKind",
    "sharedProperties": [
    {
        "name": "commandId",
        "type": "String",
        "isList": false,
        "isOptional": false,
        "mayBeNull": false
    },
    {
        "name": "messageKind",
        "type": "String",
        "isList": false,
        "isOptional": false,
        "mayBeNull": false
    },
    {
        "name": "protocolMessages",
        "type": "ProtocolMessage",
        "isList": true,
        "isOptional": false,
        "mayBeNull": false
    }
],
    "messages": [
    {
        "name": "AddPartition",
        "properties": [
            {
                "name": "newPartition",
                "type": "LionWebDeltaJsonChunk",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeletePartition",
        "properties": [
            {
                "name": "deletedPartition",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ChangeClassifier",
        "properties": [
            {
                "name": "newClassifier",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "node",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddProperty",
        "properties": [
            {
                "name": "node",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "property",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newValue",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ChangeProperty",
        "properties": [
            {
                "name": "node",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "property",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newValue",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeletePropery",
        "properties": [
            {
                "name": "node",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "property",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddChild",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newChild",
                "type": "LionWebDeltaJsonChunk",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "containment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeleteChild",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deletedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "containment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ReplaceChild",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newChild",
                "type": "LionWebDeltaJsonChunk",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "containment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveChildFromOtherContainment",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newContainment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveChildFromOtherContainmentInSameParent",
        "properties": [
            {
                "name": "newContainment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveChildInSameContainment",
        "properties": [
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceChildFromOtherContainment",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newContainment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceChildFromOtherContainmentInSameParent",
        "properties": [
            {
                "name": "newContainment",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceChildInSameContainment",
        "properties": [
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedChild",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddAnnotation",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newAnnotation",
                "type": "LionWebDeltaJsonChunk",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeleteAnnotation",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deletedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ReplaceAnnotation",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newAnnotation",
                "type": "LionWebDeltaJsonChunk",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAnnotationFromOtherParent",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAnnotationInSameParent",
        "properties": [
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceAnnotationFromOtherParent",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceAnnotationInSameParent",
        "properties": [
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedAnnotation",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddReference",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeleteReference",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deletedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deleteResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ChangeReference",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveEntryFromOtherReference",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveEntryFromOtherReferenceInSameParent",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveEntryInSameReference",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceEntryFromOtherReference",
        "properties": [
            {
                "name": "newParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldParent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceEntryFromOtherReferenceInSameParent",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldReference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "MoveAndReplaceEntryInSameReference",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldIndex",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "replacedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "movedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddReferenceResolveInfo",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeleteReferenceResolveInfo",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deletedResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ChangeReferenceResolveInfo",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldResolveInfo",
                "type": "String",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "AddReferenceTarget",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "DeleteReferenceTarget",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "deletedTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "ChangeReferenceTarget",
        "properties": [
            {
                "name": "parent",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "reference",
                "type": "LionWebJsonPointer",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "index",
                "type": "Number",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "newTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            },
            {
                "name": "oldTarget",
                "type": "LionWebId",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    },
    {
        "name": "CompositeCommand",
        "properties": [
            {
                "name": "parts",
                "type": "Command",
                "isList": false,
                "isOptional": false,
                "mayBeNull": false
            }
        ]
    }
]
}
