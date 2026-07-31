import type { FreNode } from "../../ast/index.js";

/**
 * Serializer interface for serialization and deserialization of Fren nodes.
 * Depending on the backend there are different implementations.
 */
export interface FreSerializer<TSerialized extends object> {
    /**
     * Serialize a FreNode into the implementation's external format.
     *
     * @param freNode the root node to serialize
     */
    serializeFreNode(freNode: FreNode): TSerialized
}

export interface FreDeserializer {
    /**
     * Deserialize an external representation into a FreNode.
     *
     * @param serializedObject the representation to deserialize
     * @returns the deserialized root node, or null when no root can be found
     */
    deserializeFreNode(serializedObject: object): FreNode | null
}
