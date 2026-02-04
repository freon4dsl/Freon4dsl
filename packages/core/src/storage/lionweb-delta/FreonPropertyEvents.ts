import type { PropertyAddedEvent, PropertyChangedEvent, PropertyDeletedEvent } from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { findNode } from "../../ast-utils/FindNodes.js"
import { FREON } from "../../environment/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { isNullOrUndefined } from "../../util/index.js"

const LOGGER = new FreLogger("FreonPropertyEvents")

export class FreonPropertyEvents {
    constructor() {}

    PropertyAddedFunction = (msg: PropertyAddedEvent): void => {
        LOGGER.log("Called PropertyAddedFunction " + msg.messageKind)
        const node = findNode(msg.node, FREON.modelManager.model)
        if (isNullOrUndefined(node)) {
            LOGGER.error(`Node with id ${msg.node} not found in the model`)
            return
        }
        const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
        const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.property.key)
        node[langProperty.name] = msg.newValue
    }

    PropertyDeletedFunction = (msg: PropertyDeletedEvent): void => {
        LOGGER.log("Not Implemented Yet: PropertyDeletedFunction " + msg.messageKind)
    }

    PropertyChangedFunction = (msg: PropertyChangedEvent): void => {
        LOGGER.log("LionWeb PropertyChangedFunction " + msg.messageKind)
        const node = findNode(msg.node, FREON.modelManager.model)
        if (isNullOrUndefined(node)) {
            LOGGER.error(`Node with id ${msg.node} not found in the model`)
            return
        }
        const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
        const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.property.key)
        node[langProperty.name] = msg.newValue
    }

    eventFunctions: ReceivingDelta[] = [
        {
            messageKind: "PropertyAdded",
            // @ts-expect-error TS2322
            processor: this.PropertyAddedFunction,
        },
        {
            messageKind: "PropertyChanged",
            // @ts-expect-error TS2322
            processor: this.PropertyChangedFunction,
        },
    ]
}
