import { TreeNodeData } from "$lib/tree/TreeNodeData"

import type {
    DeltaEvent,
    ClassifierChangedEvent,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyDeletedEvent,
    PropertyChangedEvent,
    ChildAddedEvent,
    ChildDeletedEvent,
    ChildReplacedEvent,
    ChildMovedFromOtherContainmentEvent,
    ChildMovedFromOtherContainmentInSameParentEvent,
    ChildMovedInSameContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentInSameParentEvent,
    ChildMovedAndReplacedInSameContainmentEvent,
    AnnotationAddedEvent,
    AnnotationDeletedEvent,
    AnnotationReplacedEvent,
    AnnotationMovedFromOtherParentEvent,
    AnnotationMovedInSameParentEvent,
    AnnotationMovedAndReplacedFromOtherParentEvent,
    AnnotationMovedAndReplacedInSameParentEvent,
    ReferenceAddedEvent,
    ReferenceDeletedEvent,
    ReferenceChangedEvent,
    CompositeEvent,
    ErrorEvent,
    LionWebId,
} from "@lionweb/server-delta-shared" // adjust path

// -------------------- public API --------------------

export function deltaEventToTreeNodeData(ev: DeltaEvent): TreeNodeData {

    const common: TreeNodeData[] = [
        leaf("sequenceNumber", ev.sequenceNumber),
        listNode("originCommands", ev.originCommands),
        listNode("additionalInfo", ev.additionalInfos),
    ]

    const specific = eventSpecificChildren(ev)

    return node(ev.messageKind, [node("meta", common), ...specific])
}

// -------------------- event-specific mapping --------------------

function eventSpecificChildren(ev: DeltaEvent): TreeNodeData[] {
    switch (ev.messageKind) {
        case "ClassifierChanged": {
            const e = ev as ClassifierChangedEvent
            return [nodeWithAbout("node", e.node), valueNode("oldClassifier", e.oldClassifier), valueNode("newClassifier", e.newClassifier)]
        }

        case "PartitionAdded": {
            const e = ev as PartitionAddedEvent
            return [valueNode("newPartition", e.newPartition)]
        }

        case "PartitionDeleted": {
            const e = ev as PartitionDeletedEvent
            return [leaf("deletedPartition", e.deletedPartition), valueNode("deletedDescendants", e.deletedDescendants)]
        }

        case "PropertyAdded": {
            const e = ev as PropertyAddedEvent
            return [nodeWithAbout("node", e.node), valueNode("property", e.property), leaf("newValue", e.newValue)]
        }

        case "PropertyDeleted": {
            const e = ev as PropertyDeletedEvent
            return [nodeWithAbout("node", e.node), valueNode("property", e.property), leaf("oldValue", e.oldValue)]
        }

        case "PropertyChanged": {
            const e = ev as PropertyChangedEvent
            return [nodeWithAbout("node", e.node), valueNode("property", e.property), leaf("oldValue", e.oldValue), leaf("newValue", e.newValue)]
        }

        case "ChildAdded": {
            const e = ev as ChildAddedEvent
            return [nodeWithAbout("parent", e.parent), valueNode("containment", e.containment), leaf("index", e.index), valueNode("newChild", e.newChild)]
        }

        case "ChildDeleted": {
            const e = ev as ChildDeletedEvent
            return [
                nodeWithAbout("parent", e.parent),
                valueNode("containment", e.containment),
                leaf("index", e.index),
                leaf("deletedChild", e.deletedChild),
                valueNode("deletedDescendants", e.deletedDescendants),
            ]
        }

        case "ChildReplaced": {
            const e = ev as ChildReplacedEvent
            return [
                nodeWithAbout("parent", e.parent),
                valueNode("containment", e.containment),
                leaf("index", e.index),
                leaf("replacedChild", e.replacedChild),
                valueNode("replacedDescendants", e.replacedDescendants),
                valueNode("newChild", e.newChild),
            ]
        }

        case "ChildMovedFromOtherContainment": {
            const e = ev as ChildMovedFromOtherContainmentEvent
            return [
                nodeWithAbout("oldParent", e.oldParent),
                valueNode("oldContainment", e.oldContainment),
                leaf("oldIndex", e.oldIndex),
                nodeWithAbout("newParent", e.newParent),
                valueNode("newContainment", e.newContainment),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
            ]
        }

        case "ChildMovedFromOtherContainmentInSameParent": {
            const e = ev as ChildMovedFromOtherContainmentInSameParentEvent
            return [
                nodeWithAbout("parent", e.parent),
                valueNode("oldContainment", e.oldContainment),
                leaf("oldIndex", e.oldIndex),
                valueNode("newContainment", e.newContainment),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
            ]
        }

        case "ChildMovedInSameContainment": {
            const e = ev as ChildMovedInSameContainmentEvent
            return [
                nodeWithAbout("parent", e.parent),
                valueNode("containment", e.containment),
                leaf("oldIndex", e.oldIndex),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
            ]
        }

        case "ChildMovedAndReplacedFromOtherContainment": {
            const e = ev as ChildMovedAndReplacedFromOtherContainmentEvent
            return [
                nodeWithAbout("oldParent", e.oldParent),
                leaf("oldContainment", e.oldContainment),
                leaf("oldIndex", e.oldIndex),
                nodeWithAbout("newParent", e.newParent),
                valueNode("newContainment", e.newContainment),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
                leaf("replacedChild", e.replacedChild),
                valueNode("replacedDescendants", e.replacedDescendants),
            ]
        }

        case "ChildMovedAndReplacedFromOtherContainmentInSameParent": {
            const e = ev as ChildMovedAndReplacedFromOtherContainmentInSameParentEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("oldContainment", e.oldContainment),
                leaf("oldIndex", e.oldIndex),
                valueNode("newContainment", e.newContainment),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
                leaf("replacedChild", e.replacedChild),
                valueNode("replacedDescendants", e.replacedDescendants),
            ]
        }

        case "ChildMovedAndReplacedInSameContainment": {
            const e = ev as ChildMovedAndReplacedInSameContainmentEvent
            return [
                nodeWithAbout("parent", e.parent),
                valueNode("containment", e.containment),
                leaf("oldIndex", e.oldIndex),
                leaf("newIndex", e.newIndex),
                leaf("movedChild", e.movedChild),
                leaf("replacedChild", e.replacedChild),
                valueNode("replacedDescendants", e.replacedDescendants),
            ]
        }

        case "AnnotationAdded": {
            const e = ev as AnnotationAddedEvent
            return [nodeWithAbout("parent", e.parent), leaf("index", e.index), valueNode("newAnnotation", e.newAnnotation)]
        }

        case "AnnotationDeleted": {
            const e = ev as AnnotationDeletedEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("index", e.index),
                leaf("deletedAnnotation", e.deletedAnnotation),
                valueNode("deletedDescendants", e.deletedDescendants),
            ]
        }

        case "AnnotationReplaced": {
            const e = ev as AnnotationReplacedEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("index", e.index),
                leaf("replacedAnnotation", e.replacedAnnotation),
                valueNode("replacedDescendants", e.replacedDescendants),
                valueNode("newAnnotation", e.newAnnotation),
            ]
        }

        case "AnnotationMovedFromOtherParent": {
            const e = ev as AnnotationMovedFromOtherParentEvent
            return [
                nodeWithAbout("oldParent", e.oldParent),
                leaf("oldIndex", e.oldIndex),
                nodeWithAbout("newParent", e.newParent),
                leaf("newIndex", e.newIndex),
                leaf("movedAnnotation", e.movedAnnotation),
            ]
        }

        case "AnnotationMovedInSameParent": {
            const e = ev as AnnotationMovedInSameParentEvent
            return [nodeWithAbout("parent", e.parent), leaf("oldIndex", e.oldIndex), leaf("newIndex", e.newIndex), leaf("movedAnnotation", e.movedAnnotation)]
        }

        case "AnnotationMovedAndReplacedFromOtherParent": {
            const e = ev as AnnotationMovedAndReplacedFromOtherParentEvent
            return [
                nodeWithAbout("oldParent", e.oldParent),
                leaf("oldIndex", e.oldIndex),
                nodeWithAbout("newParent", e.newParent),
                leaf("newIndex", e.newIndex),
                leaf("movedAnnotation", e.movedAnnotation),
                leaf("replacedAnnotation", e.replacedAnnotation),
                valueNode("replacedDescendants", e.replacedDescendants),
            ]
        }

        case "AnnotationMovedAndReplacedInSameParent": {
            const e = ev as AnnotationMovedAndReplacedInSameParentEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("oldIndex", e.oldIndex),
                leaf("newIndex", e.newIndex),
                leaf("movedAnnotation", e.movedAnnotation),
                leaf("replacedAnnotation", e.replacedAnnotation),
                valueNode("replacedDescendants", e.replacedDescendants),
            ]
        }

        case "ReferenceAdded": {
            const e = ev as ReferenceAddedEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("index", e.index),
                valueNode("reference", e.reference),
                leaf("newTarget", e.newTarget),
                leaf("newResolveInfo", e.newResolveInfo),
            ]
        }

        case "ReferenceDeleted": {
            const e = ev as ReferenceDeletedEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("index", e.index),
                valueNode("reference", e.reference),
                leaf("deletedTarget", e.deletedTarget),
                leaf("deletedResolveInfo", e.deletedResolveInfo),
            ]
        }

        case "ReferenceChanged": {
            const e = ev as ReferenceChangedEvent
            return [
                nodeWithAbout("parent", e.parent),
                leaf("index", e.index),
                valueNode("reference", e.reference),
                leaf("oldTarget", e.oldTarget),
                leaf("oldResolveInfo", e.oldResolveInfo),
                leaf("newTarget", e.newTarget),
                leaf("newResolveInfo", e.newResolveInfo),
            ]
        }

        case "CompositeEvent": {
            const e = ev as CompositeEvent
            return [
                node(
                    "parts",
                    (e.parts ?? []).map((p, i) => node(`#${i}`, [deltaEventToTreeNodeData(p)])),
                ),
            ]
        }

        case "NoOp": {
            return [leaf("info", "No operation")]
        }

        case "ErrorEvent": {
            const e = ev as ErrorEvent
            return [leaf("errorCode", e.errorCode), leaf("message", e.message)]
        }

        default:
            // If LionWeb adds a new kind, you still show something useful.
            return [valueNode("raw", ev)]
    }
}

// -------------------- TreeNodeData helpers --------------------

function node(name: string, children?: TreeNodeData[]) {
    return new TreeNodeData(
        name,
        undefined, // never set aboutNode
        children && children.length ? children : undefined,
    )
}

function leaf(label: string, value: unknown) {
    return new TreeNodeData(`${label}: ${formatScalar(value)}`, undefined, undefined)
}

function nodeWithAbout(label: string, id: LionWebId | undefined) {
    // no aboutNode usage; just show the id
    return leaf(label, id)
}

function listNode(label: string, list: unknown[] | undefined) {
    if (!list || list.length === 0) return node(`${label}: []`)
    return node(
        `${label} (${list.length})`,
        list.map((item, idx) => valueNode(`#${idx}`, item)),
    )
}


function valueNode(label: string, value: unknown) {
    const children = valueToTreeNodes(value)
    if (!children) return leaf(label, value)
    return node(label, children)
}

function valueToTreeNodes(value: unknown): TreeNodeData[] | null {
    if (value === null || value === undefined) return null

    const t = typeof value
    if (t === "string" || t === "number" || t === "boolean" || t === "bigint") return null

    if (Array.isArray(value)) {
        return value.map((v, i) => valueNode(`#${i}`, v))
    }

    if (t === "object") {
        const obj = value as Record<string, unknown>
        const keys = Object.keys(obj)
        if (keys.length === 0) return null

        keys.sort((a, b) => a.localeCompare(b))
        return keys.map((k) => valueNode(k, obj[k]))
    }

    return null
}

function formatScalar(value: unknown): string {
    if (value === null) return "null"
    if (value === undefined) return "undefined"
    if (typeof value === "string") return value === "" ? '""' : value

    // If someone accidentally passes an object to leaf(), show something useful
    if (typeof value === "object") {
        try {
            return JSON.stringify(value)
        } catch {
            return "[object]"
        }
    }

    return String(value)
}



