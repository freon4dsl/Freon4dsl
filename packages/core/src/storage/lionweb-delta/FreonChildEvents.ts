import type {
    ChildMovedFromOtherContainmentEvent,
    ChildReplacedEvent,
    ChildDeletedEvent,
    ChildAddedEvent,
    ChildMovedAndReplacedFromOtherContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentInSameParentEvent,
    ChildMovedAndReplacedInSameContainmentEvent,
    ChildMovedFromOtherContainmentInSameParentEvent,
    ChildMovedInSameContainmentEvent,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { runInAction } from "mobx"
import { findNode } from "../../ast-utils/FindNodes.js"
import type { FreNode } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { isNullOrUndefined } from "../../util/index.js"
import { FreLionwebSerializer } from "../serializer/index.js"
import { ChunkUtil } from "./ChunkUtil.js"
import { deltaList } from "./ProcessedDeltaList.js"

const LOGGER = new FreLogger("FreonChildEvents")

const ChildAddedFunction = (msg: ChildAddedEvent): void => {
    LOGGER.log("Called ChildAddedFunction " + msg.messageKind)
    const parent = findNode(msg.parent, FREON.modelManager.model!)
    if (isNullOrUndefined(parent)) {
        LOGGER.error(`Node with id ${msg.parent} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(parent.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.containment.key)
    if (langProperty?.propertyKind !== "part") {
        LOGGER.error(`Property '${langProperty.name}' is not a part/containment`)
        return
    }
    const childNode: FreNode = FreLionwebSerializer.getInstance().toTypeScriptInstance(ChunkUtil.deltaChunkToChunk(msg.newChild), msg.parent)
    LOGGER.log("NEW CHILD IS " + childNode?.freLanguageConcept())

    let originalNode: FreNode
    runInAction(() => {
        originalNode = parent.copy()
    })
    FREON.astChanger.changeIgnore("ChildAdded event", () => {
        if (langProperty.isList) {
            parent[langProperty.name].splice(msg.index, 0, childNode)
        } else {
            parent[langProperty.name] = childNode
        }
    })
    deltaList.add({
        delta: msg,
        originalNode: originalNode,
        changedNode: childNode,
        nodeName: undefined,
        propertyName: langProperty.name,
    })
    
}

const ChildDeletedFunction = (msg: ChildDeletedEvent): void => {
    LOGGER.log(`Called ChildDeletedFunction from parent ${msg.parent} child ${msg.deletedChild}`)
    const parent = findNode(msg.parent, FREON.modelManager.model!)
    if (isNullOrUndefined(parent)) {
        LOGGER.error(`Node with id ${msg.parent} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(parent.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.containment.key)
    if (langProperty?.propertyKind !== "part") {
        LOGGER.error(`Property '${langProperty.name}' is not a part/containment`)
        return
    }

    let originalNode: FreNode
    runInAction(() => {
        originalNode = parent.copy()
    })
    FREON.astChanger.changeIgnore("ChildDeleted event", () => {
        if (langProperty.isList) {
            if ((parent[langProperty.name][msg.index] as FreNode)?.freId() !== msg.deletedChild) {
                console.error("INCORRECT LIST INDEX FOR DELETED CHILD")
            }
            parent[langProperty.name].splice(msg.index, 1)
        } else {
            if ((parent[langProperty.name] as FreNode)?.freId() !== msg.deletedChild) {
                console.error("INCORRECT DELETED CHILD")
            }
            parent[langProperty.name] = null
        }
    })
    deltaList.add({
        delta: msg,
        originalNode: originalNode,
        changedNode: parent,
        nodeName: undefined,
        propertyName: langProperty.name,
    })
}

const ChildReplacedFunction = (msg: ChildReplacedEvent): void => {
    LOGGER.log("Called ChildReplacedFunction " + msg.messageKind)
}

const ChildMovedFromOtherContainmentFunction = (msg: ChildMovedFromOtherContainmentEvent): void => {
    LOGGER.log("Called ChildMovedFromOtherContainmentFunction " + msg.messageKind)
}

const ChildMovedFromOtherContainmentInSameParentFunction = (msg: ChildMovedFromOtherContainmentInSameParentEvent): void => {
    LOGGER.log("Called ChildMovedFromOtherContainmentInSameParentFunction " + msg.messageKind)
}

const ChildMovedInSameContainmentFunction = (msg: ChildMovedInSameContainmentEvent): void => {
    LOGGER.log("Called ChildMovedInSameContainmentFunction " + msg.messageKind)
}

const ChildMovedAndReplacedFromOtherContainmentFunction = (msg: ChildMovedAndReplacedFromOtherContainmentEvent): void => {
    LOGGER.log("Called ChildMovedAndReplacedFromOtherContainmentFunction " + msg.messageKind)
}

const ChildMovedAndReplacedFromOtherContainmentInSameParentFunction = (msg: ChildMovedAndReplacedFromOtherContainmentInSameParentEvent): void => {
    LOGGER.log("Called ChildMovedAndReplacedFromOtherContainmentInSameParentFunction " + msg.messageKind)
}

const ChildMovedAndReplacedInSameContainmentFunction = (msg: ChildMovedAndReplacedInSameContainmentEvent): void => {
    LOGGER.log("Called ChildMovedAndReplacedInSameContainmentFunction " + msg.messageKind)
}

export const childEventFunctions: ReceivingDelta[] = [
    {
        messageKind: "ChildAdded",
        // @ts-expect-error TS2322
        processor: ChildAddedFunction,
    },
    {
        messageKind: "ChildDeleted",
        // @ts-expect-error TS2322
        processor: ChildDeletedFunction,
    },
    {
        messageKind: "ChildMovedAndReplacedFromOtherContainment",
        // @ts-expect-error TS2322
        processor: ChildMovedAndReplacedFromOtherContainmentFunction,
    },
    {
        messageKind: "ChildMovedAndReplacedFromOtherContainmentInSameParent",
        // @ts-expect-error TS2322
        processor: ChildMovedAndReplacedFromOtherContainmentInSameParentFunction,
    },
    {
        messageKind: "ChildMovedAndReplacedInSameContainment",
        // @ts-expect-error TS2322
        processor: ChildMovedAndReplacedInSameContainmentFunction,
    },
    {
        messageKind: "ChildMovedFromOtherContainment",
        // @ts-expect-error TS2322
        processor: ChildMovedFromOtherContainmentFunction,
    },
    {
        messageKind: "ChildMovedFromOtherContainmentInSameParent",
        // @ts-expect-error TS2322
        processor: ChildMovedFromOtherContainmentInSameParentFunction,
    },
    {
        messageKind: "ChildMovedInSameContainment",
        // @ts-expect-error TS2322
        processor: ChildMovedInSameContainmentFunction,
    },
    {
        messageKind: "ChildReplaced",
        // @ts-expect-error TS2322
        processor: ChildReplacedFunction,
    },
]
