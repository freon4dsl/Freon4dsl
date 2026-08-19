import type { LionWebJsonChunk, LionWebJsonContainment, LionWebJsonMetaPointer, LionWebJsonNode, LionWebJsonReference } from "@lionweb/json"

import type { FreNamedNode, FreNode } from "../../ast/index.js"
import { FreNodeReference } from "../../ast/index.js"
import { FreLanguage, type FreLanguageClassifier, type FreLanguageConcept } from "../../language/index.js"
import type { FreLanguageProperty } from "../../language/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreUtils, isNullOrUndefined, notNullOrUndefined } from "../../util/index.js"
import type { FreSerializer } from "./FreSerialization.js"
import { createLionWebJsonNode, LanguageVersion, SerializationFormatVersion, collectUsedLanguages } from "../utils/index.js"

/*
At a high level, the class transforms a FreNode to either a LionWebJsonChunk or a list of LionWebJsonNodes

The serialization flow is:

    serializeFreNodeToChunk()
        ↓
    serializeFreNode()
        ↓
    serializeNode()
        ↓
    serializeProperty()
            ↓
        serializePart()
        serializeReference()
        serializePrimitive()
 */

const LOGGER = new FreLogger("FreLionWebSerializer")

export class FreLionWebSerializer implements FreSerializer<LionWebJsonNode[]> {
    private static theInstance: FreLionWebSerializer | undefined
    static getInstance(): FreLionWebSerializer {
        if (FreLionWebSerializer.theInstance === undefined) {
            FreLionWebSerializer.theInstance = new FreLionWebSerializer()
        }
        return FreLionWebSerializer.theInstance
    }

    constructor() {}

    /**
     * Because conversion to TypeScript nodes expects a LionWebChunk as input, this method converts
     * a single FreNode to such a chunk.
     * @param freNode the node to be transformed to JSON
     */
    public serializeFreNodeToChunk(freNode: FreNode): LionWebJsonChunk {
        const nodes: LionWebJsonNode[] = this.serializeFreNode(freNode)
        return {
            serializationFormatVersion: SerializationFormatVersion,
            languages: collectUsedLanguages(nodes),
            nodes,
        }
    }

    /**
     * Serialize a FreNode and all nodes in its containment tree to LionWeb JSON nodes.
     *
     * Each node is included only once, identified by its FreNode ID.
     *
     * @param freNode the root node of the containment tree to serialize
     * @returns the serialized LionWeb JSON nodes
     */
    public serializeFreNode(freNode: FreNode): LionWebJsonNode[] {
        LOGGER.log(`Start serializing '${freNode.freLanguageConcept()}' ` + `with ID '${freNode.freId()}'.`)

        const nodesById = new Map<string, LionWebJsonNode>()
        this.serializeNode(freNode, nodesById)
        const jsonNodes = Array.from(nodesById.values())
        LOGGER.log(`Finished serializing '${freNode.freLanguageConcept()}': ` + `${jsonNodes.length} node(s) created.`)

        return jsonNodes
    }

    /**
     * Serialize one FreNode and recursively serialize all its contained nodes.
     *
     * The node is added to `nodesById` before its properties are processed.
     * This prevents the same node from being serialized more than once.
     *
     * @param freNode the FreNode to serialize
     * @param nodesById all nodes serialized so far, indexed by their ID
     * @returns the serialized LionWeb JSON node
     */
    private serializeNode(freNode: FreNode, nodesById: Map<string, LionWebJsonNode>): LionWebJsonNode {
        const nodeId = freNode.freId()
        const existingNode = nodesById.get(nodeId)

        if (notNullOrUndefined(existingNode)) {
            LOGGER.log(`Node '${nodeId}' has already been serialized.`)
            return existingNode
        }

        // Find metadata about the FreNode
        const classifierName: string = freNode.freLanguageConcept()
        const concept: FreLanguageConcept | undefined = FreLanguage.getInstance().concept(classifierName)
        const classifier: FreLanguageClassifier | undefined = concept ?? FreLanguage.getInstance().unit(classifierName)

        if (isNullOrUndefined(classifier)) {
            throw new Error(`Cannot serialize FreNode '${nodeId}': ` + `classifier '${classifierName}' is unknown.`)
        }

        // Create the JSON Node, with parent and meta pointer
        const jsonNode: LionWebJsonNode = createLionWebJsonNode()
        jsonNode.id = nodeId
        jsonNode.parent = freNode.freIsUnit() ? null : (freNode.freOwner()?.freId() ?? null)
        jsonNode.classifier = this.createLionWebMetaPointer(classifier.key, classifier.language)

        // Store the node before serializing its containments, because those
        // recursively call this method.
        nodesById.set(nodeId, jsonNode)

        for (const property of FreLanguage.getInstance().allConceptProperties(classifierName)) {
            this.serializeProperty(property, freNode, jsonNode, nodesById)
        }

        return jsonNode
    }

    /**
     * Create a LionWeb meta-pointer for a language element.
     *
     * @param key the LionWeb key of the classifier or feature
     * @param language the LionWeb language key
     * @returns the corresponding LionWeb meta-pointer
     */
    private createLionWebMetaPointer(key: string, language: string): LionWebJsonMetaPointer {
        return {
            language,
            version: LanguageVersion,
            key,
        }
    }

    /**
     * Serialize one FreNode property into the corresponding LionWeb JSON feature.
     *
     * Containments recursively serialize their child nodes, references are stored
     * as LionWeb reference targets, and primitive values are stored as strings.
     *
     * @param property the Freon language property to serialize
     * @param freNode the node containing the property
     * @param jsonNode the LionWeb JSON node receiving the serialized feature
     * @param nodesById all nodes serialized so far, indexed by their ID
     */
    private serializeProperty(property: FreLanguageProperty, freNode: FreNode, jsonNode: LionWebJsonNode, nodesById: Map<string, LionWebJsonNode>): void {
        if (isNullOrUndefined(property.id)) {
            // todo check whether we should use property.key instead of property.id
            LOGGER.error(`Cannot serialize property '${property.name}': no ID is defined.`)
            return
        }

        switch (property.propertyKind) {
            case "part":
                this.serializePart(property, freNode, jsonNode, nodesById)
                break

            case "reference":
                this.serializeReference(property, freNode, jsonNode)
                break

            case "primitive":
                this.serializePrimitive(property, freNode, jsonNode)
                break
        }
    }

    /**
     * Serialize a containment property into a LionWeb JSON containment.
     *
     * Contained nodes are serialized recursively and added to `nodesById`.
     * An absent optional containment is not included in the JSON node.
     *
     * @param property the containment property to serialize
     * @param freNode the node that owns the containment
     * @param jsonNode the LionWeb JSON node receiving the containment
     * @param nodesById all nodes serialized so far, indexed by their ID
     */
    private serializePart(property: FreLanguageProperty, freNode: FreNode, jsonNode: LionWebJsonNode, nodesById: Map<string, LionWebJsonNode>): void {
        const value = freNode[property.name]

        // First, validate the value.
        if (isNullOrUndefined(value)) {
            LOGGER.log(`Containment '${property.name}' is absent on node '${freNode.freId()}'.`)
            return
        }
        if (property.isList) {
            FreUtils.CHECK(Array.isArray(value), `Expected an array for list containment '${property.name}' ` + `on node '${freNode.freId()}'.`)
        }

        // Next, create an empty LionWeb JSON containment.
        const jsonContainment: LionWebJsonContainment = {
            containment: this.createLionWebMetaPointer(property.key, property.language),
            children: [],
        }

        // Now, fill the containment
        if (property.isList) {
            for (const child of value as FreNode[]) {
                jsonContainment.children.push(this.serializeNode(child, nodesById).id)
            }
        } else {
            const child = value as FreNode
            jsonContainment.children.push(this.serializeNode(child, nodesById).id)
        }

        // Add the created containment to the list
        jsonNode.containments.push(jsonContainment)
    }

    /**
     * Serialize a reference property into LionWeb JSON.
     *
     * References to limited concepts are represented as primitive properties.
     * All other references are represented as LionWeb reference targets.
     *
     * @param property the reference property to serialize
     * @param freNode the node that owns the reference
     * @param jsonNode the LionWeb JSON node receiving the serialized value
     */
    private serializeReference(property: FreLanguageProperty, freNode: FreNode, jsonNode: LionWebJsonNode): void {
        const propertyConcept: FreLanguageConcept | undefined = FreLanguage.getInstance().concept(property.type)
        const value = freNode[property.name]

        // LionWeb represents limited concepts as enumeration properties.
        if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
            this.serializeLimitedReference(property, value, jsonNode)
            return
        }

        const jsonReference: LionWebJsonReference = {
            reference: this.createLionWebMetaPointer(property.key, property.language),
            targets: [],
        }

        if (property.isList) {
            FreUtils.CHECK(Array.isArray(value), `Expected an array for list reference '${property.name}' ` + `on node '${freNode.freId()}'.`)
            for (const reference of value as FreNodeReference<FreNamedNode>[]) {
                this.addReferenceTarget(reference, jsonReference, property, freNode)
            }
        } else {
            if (isNullOrUndefined(value)) {
                LOGGER.log(`Reference '${property.name}' is absent on node '${freNode.freId()}'.`)
                return
            }
            this.addReferenceTarget(value as FreNodeReference<FreNamedNode>, jsonReference, property, freNode)
        }

        jsonNode.references.push(jsonReference)
    }

    /**
     * Add one FreNodeReference as a LionWeb reference target.
     */
    private addReferenceTarget(
        reference: FreNodeReference<FreNamedNode> | null | undefined,
        jsonReference: LionWebJsonReference,
        property: FreLanguageProperty,
        freNode: FreNode,
    ): void {
        if (isNullOrUndefined(reference)) {
            LOGGER.log(`Null reference found in '${property.name}' ` + `on node '${freNode.freId()}'.`)
            return
        }

        const referredId: string | undefined = reference.referred?.freId()
        if (isNullOrUndefined(reference.name) && isNullOrUndefined(referredId)) {
            return
        }

        jsonReference.targets.push({
            resolveInfo: reference.name ?? null,
            reference: referredId ?? null,
        })
    }

    /**
     * Serialize a reference to a limited concept as a LionWeb property.
     */
    private serializeLimitedReference(property: FreLanguageProperty, value: unknown, jsonNode: LionWebJsonNode): void {
        FreUtils.CHECK(!property.isList, `LionWeb does not support list-valued limited property '${property.name}'.`)

        const reference = value as FreNodeReference<FreNamedNode> | null | undefined
        if (isNullOrUndefined(reference?.name) && !property.isOptional) {
            LOGGER.error(`Required limited property '${property.name}' has no value.`)
        }
        jsonNode.properties.push({
            property: this.createLionWebMetaPointer(property.key, property.language),
            value: this.primitiveValueToString(reference?.name),
        })
    }

    /**
     * Serialize a primitive property into a LionWeb JSON property.
     *
     * LionWeb stores primitive property values as strings. Null and undefined
     * values are represented as null.
     *
     * @param property the primitive property to serialize
     * @param freNode the node that owns the property
     * @param jsonNode the LionWeb JSON node receiving the property
     */
    private serializePrimitive(property: FreLanguageProperty, freNode: FreNode, jsonNode: LionWebJsonNode): void {
        const value = freNode[property.name]

        jsonNode.properties.push({
            property: this.createLionWebMetaPointer(property.key, property.language),
            value: this.primitiveValueToString(value),
        })
    }

    /**
     * Convert a primitive value to its LionWeb string representation.
     *
     * Null, undefined, and unsupported values are represented as null.
     */
    private primitiveValueToString(value: unknown): string | null {
        switch (typeof value) {
            case "string":
                return value

            case "boolean":
                return value ? "true" : "false"

            case "number":
                return value.toString()

            default:
                return null
        }
    }
}
