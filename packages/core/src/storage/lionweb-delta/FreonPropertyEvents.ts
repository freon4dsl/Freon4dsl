import type { PropertyAddedEvent, PropertyChangedEvent, PropertyDeletedEvent } from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { runInAction } from "mobx"
import { findNode } from "../../ast-utils/FindNodes.js"
import type { FreNode } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { isNullOrUndefined } from "../../util/index.js"
import { deltaList } from "./ProcessedDeltaList.js"

const LOGGER = new FreLogger("FreonPropertyEvents")

const PropertyAddedFunction = (msg: PropertyAddedEvent): void => {
    LOGGER.log("Called PropertyAddedFunction " + msg.messageKind)
    const node = findNode(msg.node, FREON.modelManager.model)
    if (isNullOrUndefined(node)) {
        LOGGER.error(`Node with id ${msg.node} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.property.key)
    // Administer old, (pointer) new and delta => list
    let originalNode: FreNode
    runInAction( () => {
        originalNode = node.copy()
    })
    FREON.astChanger.changeIgnore("PropertyAdded event", () => {
        node[langProperty.name] = msg.newValue
    })
    deltaList.add({
        delta: msg,
        originalNode: originalNode,
        changedNode: node,
        nodeName: undefined,
        propertyName: langProperty.name,
    })

}

const PropertyDeletedFunction = (msg: PropertyDeletedEvent): void => {
    LOGGER.log("Not Implemented Yet: PropertyDeletedFunction " + msg.messageKind)
}

const PropertyChangedFunction = (msg: PropertyChangedEvent): void => {
    LOGGER.log("LionWeb PropertyChangedFunction " + msg.messageKind)
    const node = findNode(msg.node, FREON.modelManager.model)
    if (isNullOrUndefined(node)) {
        LOGGER.error(`Node with id ${msg.node} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.property.key)
    let originalNode: FreNode
    runInAction(() => {
        originalNode = node.copy()
    })
    FREON.astChanger.changeIgnore("PropertyChanged event", () => {
        node[langProperty.name] = msg.newValue
    })
    deltaList.add({
        delta: msg,
        originalNode: originalNode,
        changedNode: node,
        nodeName: undefined,
        propertyName: langProperty.name,
    })
}

export const propertyEventFunctions: ReceivingDelta[] = [
    {
        messageKind: "PropertyAdded",
        // @ts-expect-error TS2322
        processor: PropertyAddedFunction,
    },
    {
        messageKind: "PropertyDeleted",
        // @ts-expect-error TS2322
        processor: PropertyDeletedFunction,
    },
    {
        messageKind: "PropertyChanged",
        // @ts-expect-error TS2322
        processor: PropertyChangedFunction,
    },
]
