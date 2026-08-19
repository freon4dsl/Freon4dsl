import type {
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
} from "@lionweb/json"
import { runInAction } from "mobx";
import type { FreNamedNode, FreNode } from "../../ast/index.js";
import { FreNodeReference } from "../../ast/index.js";
import { FREON } from "../../environment/index.js"
import { FreLanguage, type FreLanguageClassifier, type FreLanguageConcept } from "../../language/index.js"
import type { FreLanguageProperty } from "../../language/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils, isNullOrUndefined, jsonAsString, notNullOrUndefined } from '../../util/index.js';
import { isLionWebJsonChunk, } from "../utils/index.js"
import type { LionWebJsonProperty } from "@lionweb/server-delta-shared"
import type { FreDeserializer } from "./FreSerialization.js"

/*
At a high level, the class transforms a LionWeb JSON structure to a FreNode

The deserialization flow is:

    deserializeFreNode()
        ↓
    toTypeScriptInstanceInternal() for every JSON node
        ↓
    store ParsedNode objects in nodesfromJson
        ↓
    resolveChildrenAndReferences()
        ↓
    findRoot()
 */

const LOGGER = new FreLogger("FreLionWebDeSerializer");

/**
 * Helper types for nodes parsed from a LionWeb JSON.
 */
type ParsedChild = {
    featureName: string
    isList: boolean
    referredId: string
}
type ParsedReference = {
    featureName: string
    isList: boolean
    typeName?: string
    referredId: string | null
    resolveInfo: string
}
type ParsedNode = {
    parentId: string | null
    freNode: FreNode
    children: ParsedChild[]
    references: ParsedReference[]
}

export class FreLionWebDeserializer implements FreDeserializer {
    private nodesFromJson: Map<string, ParsedNode> = new Map<string, ParsedNode>()

    private static theInstance: FreLionWebDeserializer | undefined
    static getInstance(): FreLionWebDeserializer {
        if (FreLionWebDeserializer.theInstance === undefined) {
            FreLionWebDeserializer.theInstance = new FreLionWebDeserializer()
        }
        return FreLionWebDeserializer.theInstance
    }

    constructor() {}

    /**
     * Convert a LionWeb JSON chunk into FreNode instances.
     *
     * First all nodes are created without their containments and references.
     * Afterwards, containments and references are resolved, and the appropriate
     * root node is returned.
     *
     * @param jsonObject the LionWeb JSON chunk to deserialize
     * @param parentId optional ID of the node that should own the returned root
     */
    deserializeFreNode(jsonObject: object, parentId?: string | null): FreNode | null {
        LOGGER.log("deserializeFreNode")
        this.nodesFromJson.clear()

        if (!isLionWebJsonChunk(jsonObject)) {
            LOGGER.error("Cannot read JSON: object is not a LionWeb chunk.")
            throw new Error("Cannot read JSON: object is not a LionWeb chunk.")
        }

        LOGGER.log("SerializationFormatVersion: " + jsonObject.serializationFormatVersion)

        // Not using FREON.astChanger.change(...) here because this operation
        // should not be recorded for undo.
        runInAction(() => {
            // First create all nodes without resolving containments or references.
            for (const node of jsonObject.nodes) {
                const parsedNode = this.deserializeFreNodeInternal(node)

                if (parsedNode !== null) {
                    this.nodesFromJson.set(parsedNode.freNode.freId(), parsedNode)
                }
            }

            LOGGER.info("resolving children and references")
            this.resolveChildrenAndReferences()
            LOGGER.info("resolved children and references")
        })

        const root = this.findRoot(parentId)

        LOGGER.log("deserializeFreNode done with root")
        LOGGER.log("deserializeFreNode " + root?.freLanguageConcept())

        return root
    }

    /**
     * Return the first model unit encountered.
     * If `parentId` is supplied, return the first node whose parent has that ID.
     * If `parentId` is absent, return the first node without a parent.
     *
     * @param parentId
     * @private
     */
    private findRoot(parentId?: string | null): FreNode | null {
        // First search for a model unit or a node whose parent has the requested ID.
        for (const parsedNode of this.nodesFromJson.values()) {
            if (parsedNode.freNode.freIsUnit()) {
                return parsedNode.freNode
            } else if (notNullOrUndefined(parentId) && parsedNode.parentId === parentId) {
                return parsedNode.freNode
            }
        }

        // If no parentId was requested, search for a node without a parent.
        if (isNullOrUndefined(parentId)) {
            for (const parsedNode of this.nodesFromJson.values()) {
                if (isNullOrUndefined(parsedNode.parentId)) {
                    return parsedNode.freNode
                }
            }
        }

        return null
    }

    /**
     * Resolve the containments and references of all parsed nodes.
     *
     * During the first deserialization phase, FreNode instances are created
     * without connecting their children or references. This method performs
     * that second phase by linking child nodes from `nodesfromJson` and by
     * creating the corresponding FreNodeReference instances.
     *
     * Children that cannot be found in the parsed node map are logged and ignored.
     */
    private resolveChildrenAndReferences(): void {
        for (const parsedNode of this.nodesFromJson.values()) {
            LOGGER.log(`Resolving children and references for node ${parsedNode.freNode.freId()}`)

            for (const child of parsedNode.children) {
                const resolvedChild = this.nodesFromJson.get(child.referredId)

                if (isNullOrUndefined(resolvedChild)) {
                    LOGGER.error(`Child cannot be resolved: ${child.referredId}`)
                    continue
                }

                if (child.isList) {
                    parsedNode.freNode[child.featureName].push(resolvedChild.freNode)
                } else {
                    parsedNode.freNode[child.featureName] = resolvedChild.freNode
                }
            }

            for (const reference of parsedNode.references) {
                const freonRef = FreNodeReference.createFromLionWeb<FreNamedNode>(reference.resolveInfo, reference.referredId, reference.typeName)

                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef)
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef
                }
            }
        }
    }

    /**
     * Create a FreNode for one LionWeb JSON node.
     *
     * Primitive properties are assigned immediately. Containments and references
     * are collected and resolved later, after all FreNode instances have been
     * created.
     *
     * @param node the LionWeb JSON node to deserialize
     * @returns the partially resolved node, or null if its classifier is unknown
     */
    private deserializeFreNodeInternal(node: LionWebJsonNode): ParsedNode | null {
        LOGGER.info(`Creating FreNode for LionWeb node ${node.id}`)

        const classifierPointer: LionWebJsonMetaPointer = node.classifier

        if (isNullOrUndefined(classifierPointer)) {
            throw new Error(`Cannot deserialize LionWeb node ${node.id}: classifier is missing.`)
        }

        const conceptPointer: LionWebJsonMetaPointer = this.validateMetaPointer(classifierPointer, node)
        const classifier: FreLanguageClassifier | undefined = FreLanguage.getInstance().classifierByKey(conceptPointer.key)

        if (isNullOrUndefined(classifier)) {
            LOGGER.error(`Cannot deserialize LionWeb node ${node.id}: ` + `classifier key '${conceptPointer.key}' is unknown.`)
            return null
        }

        const freNode: FreNode = FreLanguage.getInstance().createConceptOrUnit(classifier.typeName, node.id)

        if (isNullOrUndefined(freNode)) {
            LOGGER.error(`Cannot create FreNode for classifier '${classifier.typeName}' ` + `and LionWeb node ${node.id}.`)
            return null
        }

        FREON.idProvider.usedId(freNode.freId())

        const limitedReferences = this.deserializePrimitiveProperties(freNode, conceptPointer.key, node)
        const children = this.deserializeContainments(conceptPointer.key, node)
        const references = this.deserializeReferences(conceptPointer.key, node)

        return {
            parentId: node.parent,
            freNode,
            children,
            references: references.concat(limitedReferences),
        }
    }

    /**
     * Convert primitive property values and add value directly into the `freNode`.
     * Any limited values found will be returned in the list of `ParsedReference`s
     * @param freNode       Node being converted into.
     * @param classifierKey       The Concept of the `freNode`.
     * @param jsonObject    The object being converted from.
     * @return              The parsed references for limited properties.
     * @private
     */
    private deserializePrimitiveProperties(freNode: FreNode, classifierKey: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const parsedLimiteds: ParsedReference[] = []
        const jsonProperties: LionWebJsonProperty[] = jsonObject.properties

        FreUtils.CHECK(Array.isArray(jsonProperties), `Found properties value which is not an array for node ${jsonObject.id}`)

        for (const jsonProperty of jsonProperties) {
            const propertyMetaPointer: LionWebJsonMetaPointer = this.validateMetaPointer(jsonProperty.property, jsonObject)

            const property: FreLanguageProperty | undefined = FreLanguage.getInstance().classifierPropertyByKey(classifierKey, propertyMetaPointer.key)

            if (isNullOrUndefined(property)) {
                if (propertyMetaPointer.key !== "qualifiedName") {
                    LOGGER.error(`Unknown property '${propertyMetaPointer.key}' ` + `for classifier '${classifierKey}'; property ignored.`)
                }
                continue
            }

            FreUtils.CHECK(!property.isList, `LionWeb does not support list properties: ${property.name}`)

            const propertyConcept: FreLanguageConcept | undefined = FreLanguage.getInstance().concept(property.type)

            // Limited concepts are represented as LionWeb enumeration properties.
            // Resolve the stored value later as a FreNodeReference.
            if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                if (notNullOrUndefined(jsonProperty.value)) {
                    parsedLimiteds.push({
                        featureName: property.name,
                        isList: property.isList,
                        typeName: property.type,
                        referredId: null, // intentionally null; a limited value is identified through resolveInfo, not through a node ID
                        resolveInfo: jsonProperty.value,
                    })
                }

                continue
            }

            const lionWebValue: string | null = jsonProperty.value

            if (isNullOrUndefined(lionWebValue)) {
                if (property.isOptional) {
                    freNode[property.name] = undefined
                } else {
                    LOGGER.error(`Required property '${property.name}' has no value; ` + `using its default value.`)

                    if (property.type === "string" || property.type === "identifier") {
                        freNode[property.name] = ""
                    } else if (property.type === "number") {
                        freNode[property.name] = 0
                    } else if (property.type === "boolean") {
                        freNode[property.name] = false
                    }
                }

                continue
            }
            // At this point, lionWebValue is non-null; normalize it to a primitive string.
            const value: string = lionWebValue.valueOf()

            if (property.type === "string" || property.type === "identifier") {
                freNode[property.name] = value
            } else if (property.type === "number") {
                const numberValue = Number.parseInt(value)

                if (Number.isNaN(numberValue)) {
                    LOGGER.error(`Number value for '${property.name}' has incorrect format ` + `'${value}'; initializing to 0.`)
                    freNode[property.name] = 0
                } else {
                    freNode[property.name] = numberValue
                }
            } else if (property.type === "boolean") {
                if (value !== "true" && value !== "false") {
                    LOGGER.error(`Boolean value for '${property.name}' has incorrect format ` + `'${value}'; initializing to false.`)
                }

                freNode[property.name] = value === "true"
            }
        }
        return parsedLimiteds
    }

    /**
     * Validate and copy a LionWeb meta-pointer.
     *
     * Ensures that the language, version, and key are present before returning
     * a new meta-pointer object. The containing object is used only to provide
     * context when the meta-pointer itself is missing.
     *
     * @param metaPointer the LionWeb meta-pointer to validate
     * @param containingObject the object containing the meta-pointer
     * @returns a validated LionWeb meta-pointer
     * @throws if the meta-pointer or one of its required fields is missing
     */
    private validateMetaPointer(metaPointer: LionWebJsonMetaPointer, containingObject: object): LionWebJsonMetaPointer {
        if (isNullOrUndefined(metaPointer)) {
            throw new Error(`Cannot read LionWeb JSON: meta-pointer is missing in ${jsonAsString(containingObject)}.`)
        }

        const language = metaPointer.language
        if (isNullOrUndefined(language)) {
            throw new Error(`LionWeb meta-pointer is missing its language. ${jsonAsString(metaPointer)}`)
        }
        const version = metaPointer.version
        if (isNullOrUndefined(version)) {
            throw new Error(`LionWeb meta-pointer is missing its version. ${jsonAsString(metaPointer)}`)
        }
        const key = metaPointer.key
        if (isNullOrUndefined(key)) {
            throw new Error(`LionWeb meta-pointer is missing its key. ${jsonAsString(metaPointer)}`)
        }
        return {
            language: language,
            version: version,
            key: key,
        }
    }

    /**
     * Deserialize the containments of one LionWeb JSON node.
     *
     * The child nodes are not connected yet. Instead, this method records their
     * IDs so they can be resolved after all FreNode instances have been created.
     *
     * @param classifierKey key of the classifier that owns the containments
     * @param jsonNode the LionWeb JSON node being deserialized
     * @returns the containments awaiting resolution
     */
    private deserializeContainments(classifierKey: string, jsonNode: LionWebJsonNode): ParsedChild[] {
        const jsonContainments = jsonNode.containments
        FreUtils.CHECK(Array.isArray(jsonContainments), `Found containments value which is not an array for node '${jsonNode.id}'.`)
        const parsedChildren: ParsedChild[] = []
        for (const jsonContainment of jsonContainments) {
            const containmentPointer: LionWebJsonMetaPointer = this.validateMetaPointer(jsonContainment.containment, jsonNode)
            const property: FreLanguageProperty | undefined = FreLanguage.getInstance().classifierPropertyByKey(classifierKey, containmentPointer.key)

            if (isNullOrUndefined(property)) {
                LOGGER.error(`Unknown containment '${containmentPointer.key}' ` + `for classifier '${classifierKey}'; containment ignored.`)
                continue
            }
            FreUtils.CHECK(property.propertyKind === "part", `Containment value found for non-part property '${property.name}'.`)
            const childIds: string[] = jsonContainment.children
            FreUtils.CHECK(Array.isArray(childIds), `Found children value which is not an array for property '${property.name}'.`)

            for (const childId of childIds) {
                if (notNullOrUndefined(childId)) {
                    parsedChildren.push({
                        featureName: property.name,
                        isList: property.isList,
                        referredId: childId,
                    })
                }
            }
        }
        return parsedChildren
    }

    /**
     * Deserialize the references of one LionWeb JSON node.
     *
     * References are not resolved immediately. Instead, their target IDs and
     * resolve information are recorded so FreNodeReference instances can be
     * created after all FreNode instances have been constructed.
     *
     * Both the current LionWeb target format and the older string-only target
     * format are supported.
     *
     * @param classifierKey key of the classifier that owns the references
     * @param jsonNode the LionWeb JSON node being deserialized
     * @returns the references awaiting resolution
     */
    private deserializeReferences(classifierKey: string, jsonNode: LionWebJsonNode): ParsedReference[] {
        const jsonReferences: LionWebJsonReference[] = jsonNode.references

        FreUtils.CHECK(Array.isArray(jsonReferences), `Found references value which is not an array for node '${jsonNode.id}'.`)

        const parsedReferences: ParsedReference[] = []

        for (const jsonReference of jsonReferences) {
            const referencePointer: LionWebJsonMetaPointer = this.validateMetaPointer(jsonReference.reference, jsonNode)

            const property: FreLanguageProperty | undefined = FreLanguage.getInstance().classifierPropertyByKey(classifierKey, referencePointer.key)

            if (isNullOrUndefined(property)) {
                LOGGER.error(`Unknown reference '${referencePointer.key}' ` + `for classifier '${classifierKey}'; reference ignored.`)
                continue
            }

            FreUtils.CHECK(property.propertyKind === "reference", `Reference value found for non-reference property '${property.name}'.`)

            const targets = jsonReference.targets as Array<LionWebJsonReferenceTarget | string | null>

            FreUtils.CHECK(Array.isArray(targets), `Found targets value which is not an array for property '${property.name}'.`)

            for (const target of targets) {
                if (isNullOrUndefined(target)) {
                    continue
                }

                if (typeof target === "object") {
                    parsedReferences.push({
                        featureName: property.name,
                        isList: property.isList,
                        typeName: property.type,
                        referredId: target.reference,
                        resolveInfo: target.resolveInfo ?? "",
                    })
                } else if (typeof target === "string") {
                    // Support the old LionWeb reference format, which stored only
                    // the target node ID.
                    parsedReferences.push({
                        featureName: property.name,
                        isList: property.isList,
                        typeName: property.type,
                        referredId: target,
                        resolveInfo: "",
                    })
                } else {
                    LOGGER.error(`Incorrect reference target format for property ` + `'${property.name}': ${jsonAsString(target)}.`)
                }
            }
        }

        return parsedReferences
    }
}
