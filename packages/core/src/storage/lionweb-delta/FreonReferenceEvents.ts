import type {
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { findNode } from "../../ast-utils/FindNodes.js"
import { FreNodeReference } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLanguage } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { isNullOrUndefined } from "../../util/index.js"

const LOGGER = new FreLogger("FreonReferenceEvents").show()

const ReferenceAddedFunction = (msg: ReferenceAddedEvent): void => {
    LOGGER.log(`Called ReferenceAddedFunction reference ${msg.reference.key} resolve ${msg.newResolveInfo}`)
    const node = findNode(msg.parent, FREON.modelManager.model)
    if (isNullOrUndefined(node)) {
        LOGGER.error(`Node with id ${msg.parent} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.reference.key)
    LOGGER.log(`node ${node.freId()} langProperty ${JSON.stringify(langProperty)}`)
    if (langProperty.isList) {
        FREON.astChanger.changeIgnore("ReferenceAddedEvent", () => {
            node[langProperty.name][msg.index] = FreNodeReference.create(msg.newResolveInfo, langProperty.type)
        })
    } else {
        FREON.astChanger.changeIgnore("ReferenceAddedEvent", () => {
            node[langProperty.name] = FreNodeReference.create(msg.newResolveInfo, langProperty.type)
        })
    }
}

const ReferenceDeletedFunction = (msg: ReferenceDeletedEvent): void => {
    LOGGER.log("Not Implemented Yet: PropertyDeletedFunction " + msg.messageKind)
    const node = findNode(msg.parent, FREON.modelManager.model)
    if (isNullOrUndefined(node)) {
        LOGGER.error(`Node with id ${msg.parent} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.reference.key)
    if (langProperty.isList) {
        FREON.astChanger.changeIgnore("ReferenceDeletedEvent", () => {
            node[langProperty.name].splice(msg.index, 1)
        })
    } else {
        FREON.astChanger.changeIgnore("ReferenceDeletedEvent", () => {
            node[langProperty.name] = null
        })
    }
}

const ReferenceChangedFunction = (msg: ReferenceChangedEvent): void => {
    LOGGER.log("LionWeb new ReferenceChangedFunction " + msg.messageKind)
    const node = findNode(msg.parent, FREON.modelManager.model)
    if (isNullOrUndefined(node)) {
        LOGGER.error(`Node with id ${msg.parent} not found in the model`)
        return
    }
    const classifierMP = FreLanguage.getInstance().classifier(node.freLanguageConcept()).key
    const langProperty = FreLanguage.getInstance().classifierPropertyByKey(classifierMP, msg.reference.key)
    if (langProperty.isList) {
        FREON.astChanger.changeIgnore("ReferenceChangedEvent", () => {
            node[langProperty.name][msg.index]["name"] = msg.newResolveInfo
        })
    } else {
        FREON.astChanger.changeIgnore("ReferenceChangedEvent", () => {
            node[langProperty.name]["name"] = msg.newResolveInfo
        })
    }
}

export const referenceEventFunctions: ReceivingDelta[] = [
    {
        messageKind: "ReferenceAdded",
        // @ts-expect-error TS2322
        processor: ReferenceAddedFunction,
    },
    {
        messageKind: "ReferenceDeleted",
        // @ts-expect-error TS2322
        processor: ReferenceDeletedFunction,
    },
    {
        messageKind: "ReferenceChanged",
        // @ts-expect-error TS2322
        processor: ReferenceChangedFunction,
    },
]
